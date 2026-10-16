# Build stage
FROM oven/bun:1.4.2-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock ./

# Install all dependencies (the build needs dev dependencies)
RUN bun install --frozen-lockfile

# Copy source code and build a standalone Node server
COPY . .
RUN ADAPTER=node bun run build

# Production stage
FROM oven/bun:1.4.2-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Origine absolue des balises canoniques et Open Graph
ENV PUBLIC_SITE_URL=https://exam-results.ohayoprepa.mg

# Install production dependencies only
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy only what's needed from builder
COPY --from=builder /app/build ./build

# Don't run as root
USER bun

EXPOSE 3000

# Hits the home route with Bun itself (no curl/wget dependency on alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "build/index.js"]
