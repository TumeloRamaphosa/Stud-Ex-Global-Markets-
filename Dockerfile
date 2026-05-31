# StudEx Meat — All-in-one Fly.io VM
# Build context: repo root (docker build -f Dockerfile .)
# Runs: Next.js (:3000) + n8n-runner (:3003) + MCP Meta Ads (:3002) + Hermes (:3004)
FROM node:20-alpine AS base

# ── Build Next.js ─────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY studex-frontend/package.json studex-frontend/package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY studex-frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Final image — all services ────────────────────────────────────
FROM base AS runner
RUN apk add --no-cache bash
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# n8n-runner
COPY n8n-runner/package.json ./services/n8n-runner/
COPY n8n-runner/src/ ./services/n8n-runner/src/
RUN cd services/n8n-runner && npm install --production

# MCP Meta Ads
COPY mcp-meta-ads/package.json ./services/mcp-meta-ads/
COPY mcp-meta-ads/src/ ./services/mcp-meta-ads/src/
RUN cd services/mcp-meta-ads && npm install --production

# Hermes Agent
COPY hermes-agent/package.json ./services/hermes-agent/
COPY hermes-agent/src/ ./services/hermes-agent/src/
RUN cd services/hermes-agent && npm install --production

# Supervisor
COPY studex-frontend/start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV N8N_RUNNER_URL=http://localhost:3003
ENV META_ADS_MCP_URL=http://localhost:3002
ENV HERMES_AGENT_URL=http://localhost:3004

CMD ["./start.sh"]
