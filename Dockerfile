# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
# We set an empty Maps key or dummy for build if Vite complains, 
# but usually Vite build doesn't need the actual key unless it's strictly validated.
RUN npm run build

# Stage 2: Build Backend & Serve
FROM node:20-alpine AS production
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --production
COPY server/ ./
# Copy built frontend from Stage 1
COPY --from=frontend-build /app/client/dist ./public
ENV PORT=8080
EXPOSE 8080
CMD ["node", "src/server.js"]
