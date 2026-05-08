import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Model singleton ─────────────────────────────────────────────────────────
let _model = null;
const getModel = () => {
  if (!_model) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERIC_AI_KEY || '';
    if (!apiKey) console.warn('[geminiService] No Gemini API key found — will use fallback mode.');
    const genAI = new GoogleGenerativeAI(apiKey);
    _model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return _model;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const stripCodeFence = (text) =>
  text.replace(/```json\n?/gi, '').replace(/```\n?$/gi, '').trim();

const parseClockToMinutes = (time) => {
  const m = String(time).match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!m) return 17 * 60 + 30;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const mer = m[3]?.toUpperCase();
  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h * 60 + min;
};

const formatClock = (totalMins) => {
  const day = 24 * 60;
  const n = ((totalMins % day) + day) % day;
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
};

// ─── Fallback (when Gemini is unavailable) ───────────────────────────────────
const fallbackIntent = (rawText) => {
  const norm = rawText.toLowerCase();
  const isGroup = /\b(and|with|group|we|us|friends|,)\b/.test(norm)
    || (norm.match(/\bat\b/g) || []).length > 1;
  const hasCar = /\b(driv|car|vehicle|owns a)\b/i.test(norm);

  return {
    mode: isGroup ? 'group' : 'solo',
    destination: 'Destination',
    city: 'your city',
    travelers: isGroup
      ? [
          { name: 'You',   location: 'your location',     hasCar: false },
          { name: 'Friend', location: 'friend location',  hasCar },
        ]
      : [{ name: 'You', location: 'your location', hasCar: false }],
    inferredPriority: norm.includes('fast') ? 'fastest'
      : norm.includes('cheap') ? 'cheapest'
      : 'balanced',
  };
};

// ─── buildSyncedSchedule (pure function — no Gemini needed) ─────────────────
export const buildSyncedSchedule = (intent, mergePoint, arrivalTime = '17:30') => {
  const arrivalMins = parseClockToMinutes(arrivalTime);
  const travelers = intent.travelers || [];
  const travelTimeByName = new Map(
    (mergePoint.travelTimes || []).map(t => [t.name, t.durationMins])
  );

  const calcedTravelers = travelers.map((t) => {
    const dur = travelTimeByName.get(t.name) ?? (t.hasCar ? 18 : 25);
    return {
      name:    t.name,
      from:    t.location,
      hasCar:  Boolean(t.hasCar),
      leaveAt: formatClock(arrivalMins - dur),
      route:   t.hasCar
        ? 'Drive to the merge point'
        : 'Take public transit to the merge point',
      segments: [{
        mode:        t.hasCar ? 'car' : 'transit',
        description: t.hasCar ? 'Drive to merge point' : 'Transit to merge point',
        duration:    dur,
        cost:        t.hasCar ? 90 : 35,
      }],
      arriveAt: formatClock(arrivalMins),
    };
  });

  return {
    mergePoint: {
      name:        mergePoint.name || 'Central Meeting Point',
      address:     mergePoint.address || '',
      type:        mergePoint.type || 'cafe',
      arrivalTime: formatClock(arrivalMins),
      lat:         mergePoint.lat,
      lng:         mergePoint.lng,
    },
    travelers: calcedTravelers,
    sharedDeparture: formatClock(arrivalMins),
    sharedRoute:     `Shared journey to ${intent.destination || 'destination'}`,
    estimatedArrival: formatClock(arrivalMins + 300),
    co2ComparedToAllPrivate: 1800,
  };
};

// ─── parseIntent ─────────────────────────────────────────────────────────────
export const parseIntent = async (rawText) => {
  const prompt = `You are Trazy, a global travel intelligence engine.
Parse the user's input and return ONLY valid JSON. No markdown. No explanation. Raw JSON only.

Identify:
- mode: "solo" | "group"
- destination: the final destination (string)
- city: the metropolitan city/region of travel (e.g. "Bengaluru, India", "New York, USA", "London, UK")
- travelers: array of { name, location, hasCar: boolean }
- inferredPriority: "fastest" | "cheapest" | "balanced"

Return schema (raw JSON only):
{
  "mode": "solo|group",
  "destination": "string",
  "city": "string",
  "travelers": [{ "name": "string", "location": "string", "hasCar": boolean }],
  "inferredPriority": "fastest|cheapest|balanced"
}

User input: "${rawText}"`;

  try {
    const result = await getModel().generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(stripCodeFence(text));
  } catch (err) {
    console.warn('[geminiService] parseIntent failed, using fallback:', err.message);
    return fallbackIntent(rawText);
  }
};

// ─── buildSoloRoutes ─────────────────────────────────────────────────────────
export const buildSoloRoutes = async (intent) => {
  const origin = intent.travelers?.[0]?.location || 'origin';
  const city = intent.city || '';

  const prompt = `You are Trazy, a global transport arbitrage engine. Return ONLY valid JSON. No markdown.

City/Region: ${city}
Solo trip: ${origin} → ${intent.destination}
Priority: ${intent.inferredPriority || 'balanced'}

Generate 3 route options: Full Public, Trazy Hybrid, Full Private.
For Hybrid: identify the EXACT switch point — the stop or station where switching to Uber/Auto/Taxi saves the most time.
Use real transit lines, bus numbers, metro lines, and landmarks for ${city} if known.
Handle first-mile: if origin is in a narrow area, suggest bike/auto/walk to nearest transit hub.

Return schema:
{
  "routes": [{
    "type": "public|hybrid|private",
    "name": "string",
    "segments": [{
      "mode": "bus|metro|walk|uber|auto|bike|taxi|train",
      "description": "string",
      "from": "string",
      "to": "string",
      "duration": number,
      "cost": number
    }],
    "switchPoint": "string | null",
    "switchReason": "string | null",
    "firstMileSuggestion": "string | null",
    "totalTime": number,
    "totalCost": number,
    "comfort": number,
    "co2Grams": number,
    "recommended": boolean,
    "insight": "string"
  }],
  "globalInsight": "string"
}`;

  try {
    const result = await getModel().generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(stripCodeFence(text));
  } catch (err) {
    console.warn('[geminiService] buildSoloRoutes failed, using fallback:', err.message);
    return {
      routes: [
        {
          type: 'public', name: 'Full Public',
          segments: [{ mode: 'bus', description: 'Public transit', from: origin, to: intent.destination, duration: 80, cost: 20 }],
          switchPoint: null, switchReason: null, firstMileSuggestion: null,
          totalTime: 80, totalCost: 20, comfort: 2, co2Grams: 600, recommended: false,
          insight: 'Cheapest but slowest option.',
        },
        {
          type: 'hybrid', name: 'Trazy Hybrid',
          segments: [
            { mode: 'bus',  description: 'Transit to midpoint', from: origin, to: 'Midpoint Stop', duration: 35, cost: 20 },
            { mode: 'uber', description: 'Ride to destination', from: 'Midpoint Stop', to: intent.destination, duration: 15, cost: 80 },
          ],
          switchPoint: 'Midpoint Stop', switchReason: 'Switch here to avoid traffic congestion.',
          firstMileSuggestion: null,
          totalTime: 50, totalCost: 100, comfort: 4, co2Grams: 400, recommended: true,
          insight: 'Best balance of speed, cost, and comfort.',
        },
        {
          type: 'private', name: 'Full Private',
          segments: [{ mode: 'uber', description: 'Direct ride', from: origin, to: intent.destination, duration: 40, cost: 350 }],
          switchPoint: null, switchReason: null, firstMileSuggestion: null,
          totalTime: 40, totalCost: 350, comfort: 5, co2Grams: 1200, recommended: false,
          insight: 'Most comfortable but highest cost and CO2.',
        },
      ],
      globalInsight: 'Hybrid routes save you significant time and cut CO2 by ~30%.',
    };
  }
};

// ─── buildGroupSchedule ──────────────────────────────────────────────────────
export const buildGroupSchedule = async (intent, mergePoint) => {
  const city = intent.city || '';

  const prompt = `You are Trazy's group sync engine. Return ONLY valid JSON. No markdown.

City/Region: ${city}
Travelers: ${JSON.stringify(intent.travelers || [])}
Destination: ${intent.destination}
Merge Point: ${mergePoint.name} at ${mergePoint.address}

Travel times to merge point:
${(mergePoint.travelTimes || []).map(t => `- ${t.name}: ${t.durationMins} mins via ${t.hasCar ? 'driving' : 'transit'}`).join('\n')}

Calculate exact "leaveAt" times so all travelers arrive at the merge point simultaneously.
Use real local transit options for ${city}. Output leaveAt as HH:MM.

Return schema:
{
  "mergePoint": { "name": "string", "address": "string", "type": "cafe|metro|mall|hub", "arrivalTime": "HH:MM" },
  "travelers": [{
    "name": "string", "from": "string", "hasCar": boolean,
    "leaveAt": "HH:MM", "route": "string",
    "segments": [{ "mode": "string", "description": "string", "duration": number, "cost": number }],
    "arriveAt": "HH:MM"
  }],
  "sharedDeparture": "HH:MM",
  "sharedRoute": "string",
  "estimatedArrival": "HH:MM",
  "co2ComparedToAllPrivate": number
}`;

  try {
    const result = await getModel().generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(stripCodeFence(text));
  } catch (err) {
    console.warn('[geminiService] buildGroupSchedule failed, using fallback:', err.message);
    return buildSyncedSchedule(intent, mergePoint);
  }
};
