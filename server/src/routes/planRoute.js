import express from 'express';
import { routeCache } from '../services/routeCache.js';
import { parseIntent, buildSoloRoutes, buildGroupSchedule } from '../services/geminiService.js';
import { calcMergePoint } from '../services/mapsService.js';

const router = express.Router();

// Strip HTML tags and enforce max length — prevents XSS-style prompt injection
const sanitizeInput = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, '')   // strip HTML
    .replace(/[<>'"]/g, '')    // strip remaining angle/quote chars
    .trim()
    .slice(0, 500);             // max 500 chars

router.post('/', async (req, res) => {
  try {
    const text = sanitizeInput(req.body?.text);

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }
    if (text.length < 3) {
      return res.status(400).json({ error: 'Query too short — please describe your trip.' });
    }

    // 1. Server-side cache check (30 min TTL)
    const cached = routeCache.get(text);
    if (cached) {
      res.setHeader('X-Trazy-Cache', 'HIT');
      return res.json(cached);
    }

    // 2. Parse intent via Gemini
    const intent = await parseIntent(text);

    let resultData;

    // 3. Branch: group vs solo
    if (intent.mode === 'group') {
      // Google Maps: Geocoding + Places + Distance Matrix
      const mergePoint = await calcMergePoint(intent);
      // Gemini: group schedule with synced departure times
      const schedule = await buildGroupSchedule(intent, mergePoint);
      resultData = { intent, schedule };
    } else {
      // Gemini: 3-option solo route with switch point
      const soloData  = await buildSoloRoutes(intent);
      const routes    = Array.isArray(soloData) ? soloData : (soloData.routes || []);
      resultData = {
        intent,
        routes,
        globalInsight: soloData.globalInsight || null,
      };
    }

    // 4. Cache the result
    routeCache.set(text, resultData);
    res.setHeader('X-Trazy-Cache', 'MISS');

    return res.json(resultData);

  } catch (error) {
    console.error('[planRoute] Unhandled error:', error.message);
    const isGemini = error.message?.includes('Gemini') || error.message?.includes('generative');
    const isMaps   = error.message?.includes('Maps') || error.message?.includes('geocode');
    const userMsg  = isGemini ? 'AI engine unavailable — please retry.'
      : isMaps    ? 'Mapping service unavailable — please retry.'
      : 'Failed to plan route. Please try again.';
    return res.status(500).json({ error: userMsg });
  }
});

export default router;
