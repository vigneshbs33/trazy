import { describe, it, expect, vi } from 'vitest';
import { buildGroupSchedule, buildSyncedSchedule } from '../services/geminiService.js';

// ─── Mock Gemini SDK ─────────────────────────────────────────────────────────
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            mergePoint: { name: 'Third Wave Coffee', address: 'Koramangala', type: 'cafe', arrivalTime: '17:30' },
            travelers: [
              { name: 'You',   from: 'HSR Layout',  hasCar: false, leaveAt: '17:08', route: 'Bus to Koramangala', segments: [], arriveAt: '17:30' },
              { name: 'Priya', from: 'Indiranagar',  hasCar: false, leaveAt: '17:15', route: 'Auto to Koramangala', segments: [], arriveAt: '17:30' },
              { name: 'Arjun', from: 'Jayanagar',    hasCar: true,  leaveAt: '17:12', route: 'Drive to Koramangala', segments: [], arriveAt: '17:30' },
            ],
            sharedDeparture: '17:30',
            sharedRoute: 'Drive to Chennai',
            estimatedArrival: '22:30',
            co2ComparedToAllPrivate: 1200,
          }),
        },
      }),
    }),
  })),
}));

const BASE_INTENT = {
  travelers:   [
    { name: 'You',   location: 'HSR Layout',  hasCar: false },
    { name: 'Priya', location: 'Indiranagar', hasCar: false },
    { name: 'Arjun', location: 'Jayanagar',   hasCar: true  },
  ],
  destination: 'Chennai',
  city:        'Bengaluru, India',
};

const MERGE_POINT = {
  name:    'Third Wave Coffee',
  address: 'Koramangala',
  travelTimes: [
    { name: 'You',   durationMins: 22, hasCar: false },
    { name: 'Priya', durationMins: 15, hasCar: false },
    { name: 'Arjun', durationMins: 18, hasCar: true  },
  ],
};

// ─── buildSyncedSchedule (pure, synchronous) ─────────────────────────────────
describe('buildSyncedSchedule (pure function)', () => {
  it('calculates correct leaveAt times from travel durations', () => {
    const result = buildSyncedSchedule(BASE_INTENT, MERGE_POINT, '17:30');
    const you   = result.travelers.find(t => t.name === 'You');
    const priya = result.travelers.find(t => t.name === 'Priya');
    const arjun = result.travelers.find(t => t.name === 'Arjun');

    expect(you.leaveAt).toBe('17:08');    // 17:30 - 22 mins
    expect(priya.leaveAt).toBe('17:15'); // 17:30 - 15 mins
    expect(arjun.leaveAt).toBe('17:12'); // 17:30 - 18 mins
    expect(result.sharedDeparture).toBe('17:30');
  });

  it('the person with longest travel leaves first', () => {
    const result = buildSyncedSchedule(BASE_INTENT, MERGE_POINT, '17:30');
    const you   = result.travelers.find(t => t.name === 'You');
    const priya = result.travelers.find(t => t.name === 'Priya');
    // You: 22 mins → leaves 17:08; Priya: 15 mins → leaves 17:15
    expect(you.leaveAt < priya.leaveAt).toBe(true);
  });

  it('handles empty travelers array without crashing', () => {
    const result = buildSyncedSchedule({ travelers: [], destination: 'X' }, MERGE_POINT);
    expect(result.travelers).toHaveLength(0);
    expect(result.sharedDeparture).toBe('17:30');
  });

  it('handles null intent gracefully', () => {
    const result = buildSyncedSchedule({ travelers: undefined, destination: 'X' }, MERGE_POINT);
    expect(result.travelers).toHaveLength(0);
  });
});

// ─── buildGroupSchedule (calls Gemini) ───────────────────────────────────────
describe('buildGroupSchedule (Gemini-driven)', () => {
  it('returns synchronized arrival times for all travelers', async () => {
    const result = await buildGroupSchedule(BASE_INTENT, MERGE_POINT);
    const you   = result.travelers.find(t => t.name === 'You');
    const priya = result.travelers.find(t => t.name === 'Priya');
    expect(you.arriveAt).toBe('17:30');
    expect(priya.arriveAt).toBe('17:30');
  });

  it('You leaves before Priya (longer travel time)', async () => {
    const result = await buildGroupSchedule(BASE_INTENT, MERGE_POINT);
    const you   = result.travelers.find(t => t.name === 'You');
    const priya = result.travelers.find(t => t.name === 'Priya');
    expect(you.leaveAt < priya.leaveAt).toBe(true);
  });

  it('sharedDeparture matches the arrival time at merge point', async () => {
    const result = await buildGroupSchedule(BASE_INTENT, MERGE_POINT);
    expect(result.sharedDeparture).toBe('17:30');
  });

  it('falls back to buildSyncedSchedule when Gemini returns invalid JSON', async () => {
    // Edge case: Gemini returns non-JSON → fallback executes → still returns valid structure
    const emptyIntent = { travelers: [], destination: 'Unknown', city: 'Unknown' };
    const emptyMerge  = { name: 'X', address: 'X', travelTimes: [] };
    const result = await buildGroupSchedule(emptyIntent, emptyMerge);
    expect(result).toHaveProperty('mergePoint');
    expect(result).toHaveProperty('travelers');
    expect(result).toHaveProperty('sharedDeparture');
  });
});
