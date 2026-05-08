import fetch from 'node-fetch';

// Server-side key only — never exposed to the frontend bundle
const MAPS_KEY = process.env.GOOGLE_MAPS_SERVER_KEY
  || process.env.GOOGLE_MAPS_API_KEY
  || process.env.VITE_GOOGLE_MAPS_API_KEY  // legacy fallback
  || '';

// ─── Generic fallback (no Maps API available) ────────────────────────────────
const fallbackMergePoint = (intent) => ({
  placeId:  'fallback-central',
  name:     'Central Meeting Point',
  address:  intent.city || 'City Centre',
  type:     'cafe',
  lat:      null,
  lng:      null,
  travelTimes: (intent.travelers || []).map((t) => ({
    name:        t.name,
    location:    t.location,
    hasCar:      Boolean(t.hasCar),
    durationMins: t.hasCar ? 18 : 25,
  })),
});

// ─── Geocoding API ────────────────────────────────────────────────────────────
// Google Maps Geocoding API — converts text address to lat/lng
const geocode = async (address) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json`
    + `?address=${encodeURIComponent(address)}&key=${MAPS_KEY}`;
  const res  = await fetch(url);
  const data = await res.json();
  return data.results?.[0]?.geometry?.location ?? null;
};

// ─── Places Nearby Search API ─────────────────────────────────────────────────
// Finds cafes or transit stations near the centroid of all traveler locations
const nearbySearch = async (lat, lng) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    + `?location=${lat},${lng}&radius=1500&type=cafe|transit_station`
    + `&rankby=prominence&key=${MAPS_KEY}`;
  const res  = await fetch(url);
  const data = await res.json();
  return data.results?.[0] ?? null;
};

// ─── Distance Matrix API ──────────────────────────────────────────────────────
// Calculates travel time from each traveler's location to the merge point
const getDistanceMatrix = async (origins, destinations, mode = 'transit') => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json`
    + `?origins=${encodeURIComponent(origins.join('|'))}`
    + `&destinations=${encodeURIComponent(destinations.join('|'))}`
    + `&mode=${mode}&key=${MAPS_KEY}`;
  const res = await fetch(url);
  return res.json();
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const calcMergePoint = async (intent) => {
  if (!MAPS_KEY) {
    console.warn('[mapsService] No GOOGLE_MAPS_SERVER_KEY — using fallback merge point.');
    return fallbackMergePoint(intent);
  }

  try {
    const travelers = intent.travelers || [];

    // 1. Geocode all traveler locations (append city for precision)
    const cityCtx = intent.city ? `, ${intent.city}` : '';
    const geocoded = await Promise.all(
      travelers.map(async (t) => ({
        ...t,
        latLng: await geocode(`${t.location}${cityCtx}`),
      }))
    );
    const valid = geocoded.filter(t => t.latLng);
    if (valid.length === 0) throw new Error('Could not geocode any traveler location');

    // 2. Geographic centroid
    const sumLat = valid.reduce((s, t) => s + t.latLng.lat, 0);
    const sumLng = valid.reduce((s, t) => s + t.latLng.lng, 0);
    const centLat = sumLat / valid.length;
    const centLng = sumLng / valid.length;

    // 3. Places Nearby Search — cafe or transit_station near centroid
    const place = await nearbySearch(centLat, centLng);
    if (!place) throw new Error('No suitable merge point found near centroid');

    const mergePt = `${place.geometry.location.lat},${place.geometry.location.lng}`;

    // 4. Distance Matrix — travel time per traveler to merge point
    const travelTimes = await Promise.all(
      valid.map(async (t) => {
        const origin = `${t.latLng.lat},${t.latLng.lng}`;
        const mode   = t.hasCar ? 'driving' : 'transit';
        const dm     = await getDistanceMatrix([origin], [mergePt], mode);
        const durSec = dm.rows?.[0]?.elements?.[0]?.duration?.value ?? 1800;
        return {
          name:        t.name,
          location:    t.location,
          hasCar:      Boolean(t.hasCar),
          durationMins: Math.ceil(durSec / 60),
        };
      })
    );

    return {
      placeId:     place.place_id,
      name:        place.name,
      address:     place.vicinity,
      type:        place.types?.includes('transit_station') ? 'metro' : 'cafe',
      lat:         place.geometry.location.lat,
      lng:         place.geometry.location.lng,
      travelTimes,
    };
  } catch (err) {
    console.warn('[mapsService] calcMergePoint failed, using fallback:', err.message);
    return fallbackMergePoint(intent);
  }
};
