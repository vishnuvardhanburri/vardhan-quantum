# ┌────────────────────────────────────────────────────────────────────┐
# │  Vardhan Quantum Frontend — Multi-stage Docker Build              │
# │  Next.js 10 + Express + Bootstrap + Redux (Flatlogic)              │
# └────────────────────────────────────────────────────────────────────┘
# Usage:
#   docker build -t vardhan-quantum-frontend . && docker run -p 3000:3000 ...
#   OR: docker compose up --build

# ── Stage 1: Builder ──────────────────────────────────────────────────
FROM node:16-alpine AS builder

WORKDIR /app

# Install yarn
RUN npm install -g yarn

# Copy lockfile + package.json for dependency caching
COPY yarn.lock package.json ./

# Node 16 needs this for old webpack (Next.js 10)
ENV NODE_OPTIONS=--openssl-legacy-provider

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 60000

# Copy source code
COPY . .

# Build Next.js app
RUN yarn build

# ── Stage 2: Runner ───────────────────────────────────────────────────
FROM node:16-alpine AS runner

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
