#!/usr/bin/env bash
# List recent Cursor Cloud Agents. Needs CURSOR_API_KEY.
set -euo pipefail
API="${CURSOR_API_HOST:-https://api.cursor.com}"
if [[ -z "${CURSOR_API_KEY:-}" && -f "$HOME/.hermes/.env" ]]; then
  CURSOR_API_KEY="$(grep -E '^CURSOR_API_KEY=' "$HOME/.hermes/.env" | tail -1 | cut -d= -f2-)"
  export CURSOR_API_KEY
fi
if [[ -z "${CURSOR_API_KEY:-}" ]]; then
  echo "CURSOR_API_KEY missing" >&2
  exit 1
fi
if [[ $# -ge 1 ]]; then
  curl -sS -u "${CURSOR_API_KEY}:" "$API/v1/agents/$1"
else
  curl -sS -u "${CURSOR_API_KEY}:" "$API/v1/agents?limit=20"
fi
echo
