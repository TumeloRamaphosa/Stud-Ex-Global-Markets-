#!/usr/bin/env bash
# Snapshot ClawX (or system) OpenClaw state so it can be restored as ~/.openclaw on Orgo.
set -euo pipefail

OUT_DIR="${OPENCLAW_BACKUP_DIR:-$HOME/Backups/openclaw}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT_DIR"

detect_state() {
  local candidates=(
    "${OPENCLAW_STATE_DIR:-}"
    "$HOME/.clawx/openclaw"
    "$HOME/.openclaw"
  )
  local d
  for d in "${candidates[@]}"; do
    [[ -n "$d" && -d "$d" ]] || continue
    if [[ -f "$d/openclaw.json" || -d "$d/workspace" || -d "$d/credentials" ]]; then
      echo "$d"
      return 0
    fi
  done
  return 1
}

STATE_DIR="$(detect_state)" || {
  echo "No OpenClaw/ClawX state found."
  echo "Looked at: \$OPENCLAW_STATE_DIR, ~/.clawx/openclaw, ~/.openclaw"
  echo "Quit searching: if ClawX is installed, open it once so ~/.clawx/openclaw exists."
  exit 1
}

echo "Using state directory: $STATE_DIR"

# Refuse if gateway looks live — SQLite copy while writing corrupts restore.
if pgrep -fil 'openclaw|clawx' >/dev/null 2>&1; then
  echo
  echo "OpenClaw or ClawX still appears to be running:"
  pgrep -fil 'openclaw|clawx' || true
  echo
  echo "Quit ClawX completely (not just hide the window), then re-run."
  echo "Override only if you are sure the gateway is stopped: FORCE_BACKUP=1 $0"
  if [[ "${FORCE_BACKUP:-}" != "1" ]]; then
    exit 2
  fi
fi

STAGE="$(mktemp -d "${TMPDIR:-/tmp}/clawx-backup.XXXXXX")"
cleanup() { rm -rf "$STAGE"; }
trap cleanup EXIT

# Always pack as .openclaw so Orgo restore lands on ~/.openclaw
mkdir -p "$STAGE/.openclaw"
# Copy, not move. Preserve ACLs/xattrs when the OS supports it.
cp -a "$STATE_DIR"/. "$STAGE/.openclaw/"

TARBALL="$OUT_DIR/openclaw-state-$STAMP.tgz"
tar czf "$TARBALL" -C "$STAGE" .openclaw
ln -sfn "$(basename "$TARBALL")" "$OUT_DIR/openclaw-state.tgz"

echo
echo "Wrote $TARBALL"
ls -lh "$TARBALL"
echo "Latest symlink: $OUT_DIR/openclaw-state.tgz"
echo
echo "Next:"
echo "  1. Host this file at a URL the Orgo VM can curl (private GitHub raw or presigned S3)."
echo "  2. export STATE_URL=... ORGO_API_KEY=... WORKSPACE_ID=..."
echo "  3. ./ops/agent-stack/openclaw/migrate-to-orgo.sh"
echo
echo "Keep ClawX stopped until Orgo is verified, or two gateways will race the same bot token."
