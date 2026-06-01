#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="${NODE_BIN:-$HOME/.local/node-v22.22.2-darwin-arm64/bin}"
NETLIFY_BIN="${NETLIFY_BIN:-netlify}"

if [[ ! -x "${NODE_BIN}/node" ]]; then
  echo "Expected a working Node 22 install at ${NODE_BIN}/node" >&2
  echo "Set NODE_BIN to a valid Node 22 bin directory before running this script." >&2
  exit 1
fi

export PATH="${NODE_BIN}:$PATH"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-${REPO_ROOT}/.npm-cache}"

mkdir -p "${NPM_CONFIG_CACHE}"

cd "${REPO_ROOT}"
if command -v "${NETLIFY_BIN}" >/dev/null 2>&1; then
  exec "${NETLIFY_BIN}" dev
fi

if command -v npx >/dev/null 2>&1; then
  exec npx --yes netlify-cli dev
fi

echo "Neither netlify nor npx is available on PATH." >&2
exit 1
