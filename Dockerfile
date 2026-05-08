# ════════════════════════════════════════════════════════════════════
# Stage 1: Build frontend (Vite)
# ════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS frontend-build
WORKDIR /app/client

# Install deps first (layer-cached unless package.json changes)
COPY client/package*.json ./
RUN npm ci

# Copy source + .env so VITE_* vars are embedded at build time
COPY client/ ./
COPY .env .env

# Bake the production bundle
RUN npm run build

# ════════════════════════════════════════════════════════════════════
# Stage 2: Production server
# ════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS production
WORKDIR /app

# Install server deps (production only)
COPY server/package*.json ./
RUN npm ci --production

# Copy server source
COPY server/ .

# Copy .env next to server root so dotenv finds it at /app/.env
COPY .env .env

# Copy the Vite build into /app/public (served statically)
COPY --from=frontend-build /app/client/dist ./public

# Cloud Run always injects PORT=8080 via env; we set it as default too
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Healthcheck — Cloud Run will wait for 200 on /
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["node", "src/server.js"]
