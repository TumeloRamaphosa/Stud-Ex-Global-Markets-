#!/usr/bin/env bash
# Deploy the command-center static site. Run on a logged-in laptop.
set -euo pipefail
cd "$(dirname "$0")"

case "${1:-help}" in
  vercel)
    npx --yes vercel --prod --yes
    ;;
  cloudflare|pages)
    npx --yes wrangler pages deploy . --project-name studex-command-center
    ;;
  *)
    echo "Usage: $0 vercel | cloudflare"
    echo "Requires vercel login / wrangler login on this machine."
    exit 1
    ;;
esac
