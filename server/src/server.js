import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Load .env ─────────────────────────────────────────────────────────────────
// Possible locations (dev: repo root, prod: /app/.env next to server)
const envPaths = [
  path.resolve(__dirname, '../.env'),   // /app/.env  ← production container
  path.resolve(__dirname, '../../.env'), // repo root  ← local dev
];
for (const p of envPaths) {
  const result = dotenv.config({ path: p });
  if (!result.error) { console.log(`[env] loaded from ${p}`); break; }
}

import planRoute from './routes/planRoute.js';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ───────────────────────────────────────────────────────────────────────
const rawOrigins   = process.env.FRONTEND_URL || '';
const allowedOrigins = rawOrigins
  ? rawOrigins.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl / server-to-server
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error(`CORS: "${origin}" not allowed`));
  },
  optionsSuccessStatus: 200,
}));

// ── Body limit ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/plan-route', planRoute);

// ── Serve Vite build ──────────────────────────────────────────────────────────
// /app/public in production, or the nearest 'public' folder in dev
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath, { maxAge: '1d', etag: true }));

// SPA fallback — serve index.html for any non-API, non-asset route
app.get('*', (req, res, next) => {
  // Let real static assets 404 instead of falling back to index.html
  if (req.path.startsWith('/assets/') || req.path.startsWith('/favicon')) {
    return next();
  }
  const idx = path.join(publicPath, 'index.html');
  res.sendFile(idx, (err) => {
    if (err) res.status(404).send('Not found');
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8080', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Trazy  port=${PORT}  env=${process.env.NODE_ENV || 'dev'}`);
  console.log(`   Gemini key present : ${Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERIC_AI_KEY)}`);
  console.log(`   Maps server key    : ${Boolean(process.env.GOOGLE_MAPS_SERVER_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY)}`);
  console.log(`   Static files from  : ${publicPath}\n`);
});
