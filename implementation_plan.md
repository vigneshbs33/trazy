# Trazy Implementation Plan

## Goal
Build Trazy as a Bengaluru transport arbitrage engine that plans solo hybrid routes and group merge-point journeys with synchronized departure times.

## Architecture
- Frontend: Vite React, Tailwind CSS, Framer Motion, `@react-google-maps/api`.
- Backend: Express API proxy with `helmet`, restricted `cors`, `.env` secret loading, Gemini, Google Maps server calls, and a 30-minute in-memory route cache.
- Deployment: Multi-stage Docker build serving the Vite bundle from Express on Cloud Run.

## Product Flows
- Landing command bar accepts natural language travel requests and example chips.
- Backend sanitizes input, parses intent, and returns a full route plan.
- Confirmation modal lets the user verify parsed travelers, driver, destination, and priority.
- Solo results show public, hybrid, and private route cards, a switch point, CO2 savings, speech playback, and a map.
- Group results show a merge point, per-traveler leave times, shared departure, CO2 savings, speech playback, and a staged map.

## Backend Work
- `server/src/server.js`: Express entry point, security middleware, CORS, JSON parsing, static frontend serving.
- `server/src/routes/planRoute.js`: POST `/api/plan-route`, input sanitization, cache lookup, intent parsing, solo/group branching, response normalization.
- `server/src/services/geminiService.js`: Gemini prompts, safe JSON parsing, robust deterministic fallbacks for no-key test/demo mode.
- `server/src/services/mapsService.js`: geocoding, centroid, Places nearby search, Distance Matrix timing, deterministic fallback merge point.
- `server/src/services/routeCache.js`: MD5-keyed in-memory cache with 30-minute TTL.

## Frontend Work
- `client/src/App.jsx`: state machine for `LANDING`, `PARSING`, `CONFIRMING`, `SOLO_RESULTS`, and `GROUP_RESULTS`, plus client-side cache usage.
- `AgentBar`, `ConfirmModal`, `MapView`, `SoloCards`, `LiveSyncPanel`: accessible, keyboard-friendly UI for the full judge demo.
- `MapView`: uses Google Maps when a public key is present, and a mock-safe visual map when absent so tests and demos never blank out.
- Shared components: CO2 badge, speech button, aria-live announcer.

## Testing
- Server Vitest: intent parsing fallback and group time synchronization.
- Client Vitest: real RouteCard rendering assertions.
- Playwright: solo and group flows with backend API mocked at the browser layer for deterministic E2E runs.

## Deployment
- Dockerfile builds `client/`, installs `server/`, copies `client/dist` to `server/public`, and runs Express.
- Cloud Run target region: `asia-south1`.
- Required runtime env: `GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `FRONTEND_URL`.
- Required frontend build env: `VITE_MAPS_PUBLIC_KEY` or `VITE_GOOGLE_MAPS_API_KEY`.
