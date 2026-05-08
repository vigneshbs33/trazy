import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env — try two common CWD positions
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERIC_AI_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}

import planRoute from './routes/planRoute.js';

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ─── CORS — locked to explicit origins ───────────────────────────────────────
const rawOrigins = process.env.FRONTEND_URL || '';
const allowedOrigins = rawOrigins
  ? rawOrigins.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server / curl (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not in allowlist`));
  },
  optionsSuccessStatus: 200,
}));

// Limit body size — prevents oversized payload attacks
app.use(express.json({ limit: '10kb' }));

// ─── API routes ──────────────────────────────────────────────────────────────
app.use('/api/plan-route', planRoute);

// ─── Serve frontend build (production) ───────────────────────────────────────
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Wildcard ONLY for non-API paths — prevents catching /api/* routes
app.get(/^(?!\/api).*$/, (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '8080', 10);

app.listen(PORT, () => {
  console.log(`\n🚀 Trazy server running on port ${PORT}`);
  console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Origins: ${allowedOrigins.join(', ')}\n`);
});
