#!/usr/bin/env bash
# Collect Vercel + Cloudflare identifiers for studex-group.com.
# Run on a machine that is already logged in (`vercel login`, `wrangler login`).
# Writes ops/agent-stack/cloud/ids.env — no tokens, only IDs and names.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/ids.env"
: > "$OUT"

note() { echo "$1" | tee -a "$OUT"; }

note "# Generated $(date -u +%Y-%m-%dT%H:%M:%SZ) on $(hostname)"
note "# Contains project/zone IDs only. Do not paste tokens into chat."
note ""

if ! command -v vercel >/dev/null 2>&1; then
  echo "Installing Vercel CLI..."
  npm i -g vercel >/dev/null
fi
if ! command -v wrangler >/dev/null 2>&1; then
  echo "Installing Wrangler CLI..."
  npm i -g wrangler >/dev/null
fi

echo "=== vercel whoami ==="
if vercel whoami 2>&1 | tee /tmp/vercel-whoami.txt; then
  note "VERCEL_USER=$(tr -d '\n' < /tmp/vercel-whoami.txt | tail -c 200)"
else
  note "# vercel whoami failed — run: vercel login"
fi

echo "=== vercel projects list ==="
if vercel projects list 2>&1 | tee /tmp/vercel-projects.txt; then
  {
    echo "# vercel projects list"
    sed 's/^/# /' /tmp/vercel-projects.txt
  } >> "$OUT"
else
  note "# vercel projects list failed"
fi

echo "=== vercel projects inspect studex-group.com ==="
if vercel projects inspect studex-group.com 2>&1 | tee /tmp/vercel-inspect.txt; then
  {
    echo "# vercel projects inspect studex-group.com"
    sed 's/^/# /' /tmp/vercel-inspect.txt
  } >> "$OUT"
else
  note "# inspect failed; try: vercel projects inspect <project-name-from-list>"
fi

echo "=== wrangler whoami ==="
if wrangler whoami 2>&1 | tee /tmp/wrangler-whoami.txt; then
  {
    echo "# wrangler whoami"
    sed 's/^/# /' /tmp/wrangler-whoami.txt
  } >> "$OUT"
  # Account ID is the useful bit
  if grep -qi 'Account ID' /tmp/wrangler-whoami.txt; then
    ACCOUNT="$(grep -i 'Account ID' /tmp/wrangler-whoami.txt | awk '{print $NF}' | head -1)"
    note "CLOUDFLARE_ACCOUNT_ID=$ACCOUNT"
  fi
else
  note "# wrangler whoami failed — run: wrangler login"
fi

echo "=== wrangler zone list (or pages project list) ==="
if wrangler zones list 2>&1 | tee /tmp/wrangler-zones.txt; then
  {
    echo "# wrangler zones list"
    sed 's/^/# /' /tmp/wrangler-zones.txt
  } >> "$OUT"
elif wrangler zone list 2>&1 | tee /tmp/wrangler-zones.txt; then
  {
    echo "# wrangler zone list"
    sed 's/^/# /' /tmp/wrangler-zones.txt
  } >> "$OUT"
else
  note "# wrangler zone list failed (CLI subcommand names vary by version)"
fi

echo
echo "Wrote $OUT"
echo "Redact anything that looks like a token, then paste this file back into Cursor."
