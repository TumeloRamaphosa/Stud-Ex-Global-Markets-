#!/bin/sh
# Supervisor script — runs all services on one Fly.io VM
# Main app (Next.js :3000) + n8n-runner (:3003) + Meta Ads MCP (:3002) + Hermes (:3004)

echo "=== StudEx Meat — Starting all services ==="

# Start n8n-runner in background
if [ -d /app/services/n8n-runner ]; then
  echo "Starting n8n-runner on :3003..."
  cd /app/services/n8n-runner && node src/index.js &
fi

# Start MCP Meta Ads in background
if [ -d /app/services/mcp-meta-ads ]; then
  echo "Starting MCP Meta Ads on :3002..."
  cd /app/services/mcp-meta-ads && node src/index.js &
fi

# Start Hermes Content Agent in background
if [ -d /app/services/hermes-agent ]; then
  echo "Starting Hermes Agent on :3004..."
  cd /app/services/hermes-agent && node src/index.js &
fi

# Start main Next.js app (foreground — Fly.io health checks this)
echo "Starting Next.js on :3000..."
cd /app && exec node server.js
