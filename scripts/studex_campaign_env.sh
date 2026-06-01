#!/usr/bin/env bash
# Export a single campaign root so OpenFang-era assets and Hermes automation agree on paths.
#
# Usage (from repo root):
#   source scripts/studex_campaign_env.sh
#
# Override the default bundle location:
#   export STUDEX_CAMPAIGN_ROOT=/path/to/StudExMeat-by-OpenFang
#   source scripts/studex_campaign_env.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export STUDEX_CAMPAIGN_ROOT="${STUDEX_CAMPAIGN_ROOT:-$HOME/Downloads/StudExMeat-by-OpenFang}"

for f in AI_INFLUENCER_STRATEGY.md VIDEO_PROMPTS.md VIDEO_STORYBOARDS.md; do
  if [[ ! -f "${STUDEX_CAMPAIGN_ROOT}/${f}" ]]; then
    echo "Warning: missing ${STUDEX_CAMPAIGN_ROOT}/${f} (set STUDEX_CAMPAIGN_ROOT if the bundle moved)" >&2
  fi
done

echo "STUDEX_CAMPAIGN_ROOT=${STUDEX_CAMPAIGN_ROOT}"
echo ""
echo "Handoff:"
echo "  OpenFang track — generate from ${STUDEX_CAMPAIGN_ROOT}/VIDEO_PROMPTS.md + photos/ + videos/"
echo "  Hermes track — read same folder for copy checks, Slack/WhatsApp digests, schedule reminders"
echo "Repo: ${REPO_ROOT}"
