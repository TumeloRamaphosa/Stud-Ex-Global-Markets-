#!/usr/bin/env bash
# Move a ClawX/OpenClaw state tarball onto a new Orgo computer and start the daemon.
#
# Required env:
#   ORGO_API_KEY   from https://www.orgo.ai/start  (sk_live_...)
#   WORKSPACE_ID   Orgo workspace id
#   STATE_URL      reachable URL of openclaw-state.tgz  (preferred; no 10 MB cap)
#
# Optional:
#   COMPUTER_NAME  default openclaw-prod
#   RAM CPU DISK   default 8 / 4 / 32
#   STATE_FILE     local tarball; used only if STATE_URL is unset AND size < 10 MB
set -euo pipefail

: "${ORGO_API_KEY:?Set ORGO_API_KEY (https://www.orgo.ai/start)}"
: "${WORKSPACE_ID:?Set WORKSPACE_ID (orgo.ai/workspaces)}"

API="${ORGO_API:-https://www.orgo.ai/api}"
AUTH="Authorization: Bearer $ORGO_API_KEY"
JSON="Content-Type: application/json"
NAME="${COMPUTER_NAME:-openclaw-prod}"
RAM="${RAM:-8}"
CPU="${CPU:-4}"
DISK="${DISK_SIZE_GB:-32}"

need_jq() {
  command -v jq >/dev/null 2>&1 || {
    echo "jq is required. Install jq, then re-run."
    exit 1
  }
}
need_jq

run() {
  local cmd="$1"
  curl -sS -X POST "$API/computers/$COMPUTER_ID/bash" \
    -H "$AUTH" -H "$JSON" \
    -d "$(jq -n --arg c "$cmd" '{command:$c}')"
  echo
}

echo "Creating Orgo computer $NAME (${RAM}G RAM / ${CPU} CPU / ${DISK}G disk) in workspace $WORKSPACE_ID"
RESP="$(curl -sS -X POST "$API/computers" -H "$AUTH" -H "$JSON" \
  -d "$(jq -n \
      --arg ws "$WORKSPACE_ID" \
      --arg name "$NAME" \
      --argjson ram "$RAM" \
      --argjson cpu "$CPU" \
      --argjson disk "$DISK" \
      '{workspace_id:$ws,name:$name,ram:$ram,cpu:$cpu,disk_size_gb:$disk}')")"
echo "$RESP" | jq .
COMPUTER_ID="$(echo "$RESP" | jq -r '.id // .computer_id // empty')"
if [[ -z "$COMPUTER_ID" || "$COMPUTER_ID" == "null" ]]; then
  echo "Could not parse computer id from create response."
  exit 1
fi
echo "COMPUTER_ID=$COMPUTER_ID"

if [[ -n "${STATE_URL:-}" ]]; then
  echo "Pulling state tarball from STATE_URL into the VM (no 10 MB upload cap)"
  curl -sS -X POST "$API/computers/$COMPUTER_ID/bash" \
    -H "$AUTH" -H "$JSON" \
    -d "$(jq -n --arg u "$STATE_URL" '{command:("curl -fsSL " + $u + " -o /root/Desktop/openclaw-state.tgz")}')"
  echo
elif [[ -n "${STATE_FILE:-}" ]]; then
  BYTES="$(wc -c < "$STATE_FILE")"
  if [[ "$BYTES" -gt 10485760 ]]; then
    echo "STATE_FILE is $BYTES bytes. Orgo /files/upload is capped at 10 MB."
    echo "Host the tarball and re-run with STATE_URL=..."
    exit 1
  fi
  echo "Uploading $STATE_FILE via /files/upload"
  curl -sS -X POST "$API/computers/$COMPUTER_ID/files/upload" \
    -H "$AUTH" \
    -F "file=@${STATE_FILE};filename=openclaw-state.tgz"
  echo
else
  echo "Set STATE_URL (recommended) or STATE_FILE (< 10 MB)."
  echo "Computer $COMPUTER_ID was created; it is still empty."
  exit 1
fi

echo "Installing OpenClaw"
run "curl -fsSL https://openclaw.ai/install.sh | bash"

echo "Restoring ~/.openclaw and installing the daemon"
run 'set -e
test -s /root/Desktop/openclaw-state.tgz
rm -rf ~/.openclaw
tar xzf /root/Desktop/openclaw-state.tgz -C "$HOME"
# ClawX isolation used ~/.clawx/openclaw; tarball is always packed as .openclaw
chmod -R u+rwX ~/.openclaw
if [[ -f ~/.openclaw/.env ]]; then chmod 600 ~/.openclaw/.env; fi
openclaw onboard --install-daemon
openclaw gateway status
'

echo "Verifying"
run "openclaw --version; openclaw doctor; ls ~/.openclaw | head"

echo
echo "Done. COMPUTER_ID=$COMPUTER_ID"
echo "Dashboard inside the VM: http://127.0.0.1:18789/"
echo "Webhook proxy: https://www.orgo.ai/api/desktops/${COMPUTER_ID}/proxy/"
echo
echo "Keep ClawX stopped. Re-pair WhatsApp/iMessage/Signal on the Orgo desktop."
echo "Prefer Slack Socket Mode / Telegram long-poll — Orgo has no public inbound hostname."
