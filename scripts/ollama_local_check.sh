#!/usr/bin/env bash
# Quick check that Ollama is reachable and can run a tiny chat completion.
# Use before local dev or hook this into your own automation (cron, Makefile, etc.).
set -euo pipefail

BASE="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
MODEL="${OLLAMA_MODEL:-llama3.1:8b}"

echo "Checking Ollama at ${BASE} (model: ${MODEL})"

if ! curl -sf "${BASE}/api/tags" >/dev/null; then
  echo "Ollama is not responding at ${BASE}. Start it with: ollama serve"
  echo "If Docker/other tools must reach the host, use: OLLAMA_HOST=0.0.0.0:11434 ollama serve"
  exit 1
fi

curl -sf "${BASE}/api/chat" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"${MODEL}\",\"messages\":[{\"role\":\"user\",\"content\":\"Reply with exactly: ok\"}],\"stream\":false}" \
  | grep -q '"message"' || {
    echo "Chat request failed. Pull the model with: ollama pull ${MODEL}"
    exit 1
  }

echo "Ollama OK — ${MODEL} answered a test chat."
