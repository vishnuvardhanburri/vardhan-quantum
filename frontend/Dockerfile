# ┌────────────────────────────────────────────────────────────────────┐
# │  Vardhan Quantum Frontend — Multi-stage Docker Build              │
# │  Next.js 10 + Express + Bootstrap + Redux (Flatlogic)              │
# └────────────────────────────────────────────────────────────────────┘
# Usage:
#   docker build -t vardhan-quantum-frontend . && docker run -p 3000:3000 ...
#   OR: docker compose up --build

# ── Stage 1: Builder ──────────────────────────────────────────────────
# Node 18+ required for --openssl-legacy-provider (Node 16 doesn't support it)
FROM node:18-alpine AS builder

WORKDIR /app

# Install yarn via corepack (ships with Node 16+)
RUN corepack enable 2>/dev/null || npm install -g yarn@1.22.22

# Copy lockfile + package.json for dependency caching
COPY yarn.lock package.json ./

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 60000

# Copy source code
COPY . .

# Build Next.js app (openssl-legacy-provider only needed for build, not install)
RUN NODE_OPTIONS=--openssl-legacy-provider yarn build

# ── Stage 2: Runner ───────────────────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV PORT=3000

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy Next.js build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/constants ./constants
COPY --from=builder /app/styles ./styles

# Copy server and config files needed at runtime
COPY --from=builder /app/server.js ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env.example ./.env.example

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/login || exit 1

EXPOSE 3000

# Start the Express server
CMD ["node", "server.js"]
