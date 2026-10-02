#!/usr/bin/env bash
# Start the factory Hermes backend on THIS machine (Mac Mini).
# MacBook Desktop then uses Settings → Gateways → Remote gateway.
# See GATEWAY.md. Do not run a second OpenClaw here.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
ENV_FILE="$HERMES_HOME/.env"
HOST="${HERMES_SERVE_HOST:-0.0.0.0}"
PORT="${HERMES_SERVE_PORT:-9119}"
TS_IP="${HERMES_TAILSCALE_IP:-100.112.109.40}"

if ! command -v hermes >/dev/null 2>&1; then
  echo "hermes CLI not on PATH. Install on the Mini first." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy ops/agent-stack/hermes/env.example and run apply-local.sh" >&2
  exit 1
fi

need() {
  local key="$1"
  if ! grep -Eq "^${key}=.+" "$ENV_FILE"; then
    echo "Set ${key}= in $ENV_FILE (chmod 600). See GATEWAY.md." >&2
    exit 1
  fi
}

need MINIMAX_API_KEY
need HERMES_DASHBOARD_BASIC_AUTH_USERNAME
need HERMES_DASHBOARD_BASIC_AUTH_PASSWORD

if ! grep -Eq '^HERMES_DASHBOARD_BASIC_AUTH_SECRET=.+' "$ENV_FILE"; then
  echo "Warning: HERMES_DASHBOARD_BASIC_AUTH_SECRET is empty — Desktop will sign out on every reboot." >&2
fi

echo "Starting hermes serve on ${HOST}:${PORT}"
echo "From MacBook Desktop: Remote gateway → http://${TS_IP}:${PORT}"
echo "Probe: curl -sS http://${TS_IP}:${PORT}/api/status"
echo

exec hermes serve --host "$HOST" --port "$PORT"
