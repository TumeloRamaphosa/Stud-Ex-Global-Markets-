# Dockerfile for StudEx Meat — All-in-one Fly.io VM
# Runs: Next.js (:3000) + n8n-runner (:3003) + MCP Meta Ads (:3002) + Hermes (:3004)
FROM node:20-alpine AS base

# Dependencies for Next.js
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Build Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Install service dependencies
FROM base AS svc-deps
WORKDIR /tmp
COPY ../n8n-runner/package.json /tmp/n8n-runner/
COPY ../mcp-meta-ads/package.json /tmp/mcp-meta-ads/
COPY ../hermes-agent/package.json /tmp/hermes-agent/
RUN cd /tmp/n8n-runner && npm install --production 2>/dev/null || true
RUN cd /tmp/mcp-meta-ads && npm install --production 2>/dev/null || true
RUN cd /tmp/hermes-agent && npm install --production 2>/dev/null || true

# Runner — all services in one container
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# n8n-runner service
COPY ../n8n-runner/src/ ./services/n8n-runner/src/
COPY ../n8n-runner/package.json ./services/n8n-runner/
RUN cd services/n8n-runner && npm install --production 2>/dev/null || true

# MCP Meta Ads service
COPY ../mcp-meta-ads/src/ ./services/mcp-meta-ads/src/
COPY ../mcp-meta-ads/package.json ./services/mcp-meta-ads/
RUN cd services/mcp-meta-ads && npm install --production 2>/dev/null || true

# Hermes Agent service
COPY ../hermes-agent/src/ ./services/hermes-agent/src/
COPY ../hermes-agent/package.json ./services/hermes-agent/
RUN cd services/hermes-agent && npm install --production 2>/dev/null || true

# Supervisor script
COPY start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 3000 3002 3003 3004
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV N8N_RUNNER_URL=http://localhost:3003
ENV META_ADS_MCP_URL=http://localhost:3002
ENV HERMES_AGENT_URL=http://localhost:3004

CMD ["./start.sh"]
