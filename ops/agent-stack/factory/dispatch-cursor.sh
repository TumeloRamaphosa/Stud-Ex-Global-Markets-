#!/usr/bin/env bash
# Dispatch one Cursor Cloud Agent (implementer). Does not run unless --go.
# Key: CURSOR_API_KEY in the environment or ~/.hermes/.env — never git/Drive.
set -euo pipefail

API="${CURSOR_API_HOST:-https://api.cursor.com}"
REPO="${FACTORY_REPO_URL:-https://github.com/TumeloRamaphosa/Stud-Ex-Global-Markets-}"
REF="${FACTORY_REF:-main}"
MODEL="${FACTORY_MODEL:-composer-2}"
TITLE="factory job"
PROMPT_FILE=""
PROMPT_TEXT=""
GO=0
MAX_ACTIVE="${FACTORY_MAX_ACTIVE:-1}"

usage() {
  cat <<EOF
Usage: $0 [--go] [--repo URL] [--ref BRANCH] [--model ID] [--title NAME] (--prompt-file PATH | --prompt TEXT)

Dry-run is the default. --go actually POST /v1/agents.
Default model composer-2 (Cursor Models pool). Example: --model grok-4.6
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --go) GO=1; shift ;;
    --repo) REPO="$2"; shift 2 ;;
    --ref) REF="$2"; shift 2 ;;
    --model) MODEL="$2"; shift 2 ;;
    --title) TITLE="$2"; shift 2 ;;
    --prompt-file) PROMPT_FILE="$2"; shift 2 ;;
    --prompt) PROMPT_TEXT="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "${CURSOR_API_KEY:-}" && -f "$HOME/.hermes/.env" ]]; then
  # shellcheck disable=SC1091
  set -a
  # only pull the one key; ignore the rest
  CURSOR_API_KEY="$(grep -E '^CURSOR_API_KEY=' "$HOME/.hermes/.env" | tail -1 | cut -d= -f2-)"
  set +a
  export CURSOR_API_KEY
fi

if [[ -n "$PROMPT_FILE" ]]; then
  PROMPT_TEXT="$(cat "$PROMPT_FILE")"
fi
if [[ -z "$PROMPT_TEXT" ]]; then
  echo "need --prompt-file or --prompt" >&2
  exit 2
fi

BODY="$(python3 - "$REPO" "$REF" "$MODEL" "$TITLE" "$PROMPT_TEXT" <<'PY'
import json, sys
repo, ref, model, title, prompt = sys.argv[1:6]
print(json.dumps({
    "prompt": {"text": prompt},
    "model": {"id": model},
    "name": title[:100],
    "repos": [{"url": repo, "startingRef": ref}],
    "autoCreatePR": True,
}))
PY
)"

echo "# factory dispatch (go=$GO)"
echo "# repo=$REPO ref=$REF model=$MODEL title=$TITLE"
echo "# prompt_chars=${#PROMPT_TEXT}"

if [[ "$GO" -ne 1 ]]; then
  echo "$BODY" | python3 -m json.tool
  echo "# dry-run: pass --go to POST $API/v1/agents"
  exit 0
fi

if [[ -z "${CURSOR_API_KEY:-}" ]]; then
  echo "CURSOR_API_KEY missing (set in ~/.hermes/.env)" >&2
  exit 1
fi

# Concurrency cap: refuse if too many non-terminal agents are listed.
ACTIVE="$(curl -sS -u "${CURSOR_API_KEY}:" "$API/v1/agents?limit=20" || true)"
ACTIVE_COUNT="$(python3 - "$ACTIVE" "$MAX_ACTIVE" <<'PY' || echo 0
import json, sys
raw, cap = sys.argv[1], int(sys.argv[2])
try:
    data = json.loads(raw)
except Exception:
    print(0)
    raise SystemExit(0)
items = data if isinstance(data, list) else data.get("agents") or data.get("items") or []
busy = 0
done = {"FINISHED", "COMPLETED", "FAILED", "CANCELLED", "CANCELED", "EXPIRED", "ERROR"}
for a in items:
    st = str(a.get("status") or a.get("state") or "").upper()
    run = a.get("latestRun") or a.get("run") or {}
    rst = str(run.get("status") or "").upper()
    if st not in done and rst not in done and (st or rst):
        busy += 1
print(busy)
PY
)"

if [[ "${ACTIVE_COUNT:-0}" -ge "$MAX_ACTIVE" ]]; then
  echo "refuse: $ACTIVE_COUNT active Cursor agent(s) (cap $MAX_ACTIVE). Queue this job." >&2
  exit 4
fi

curl -sS -u "${CURSOR_API_KEY}:" \
  -H 'Content-Type: application/json' \
  -X POST "$API/v1/agents" \
  -d "$BODY"
echo
