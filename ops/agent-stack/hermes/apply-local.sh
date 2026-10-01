#!/usr/bin/env bash
# Merge MiniMax + local-model templates into ~/.hermes on THIS machine.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$HERMES_HOME"

if [[ -f "$HERMES_HOME/config.yaml" ]]; then
  cp -a "$HERMES_HOME/config.yaml" "$HERMES_HOME/config.yaml.bak.$STAMP"
  echo "Backed up existing config to $HERMES_HOME/config.yaml.bak.$STAMP"
fi

python3 - "$ROOT/config.yaml" "$HERMES_HOME/config.yaml" <<'PY'
import sys
from pathlib import Path

src = Path(sys.argv[1]).read_text()
dest = Path(sys.argv[2])

try:
    import yaml  # type: ignore
except ImportError:
    dest.write_text(src)
    print("PyYAML not installed; wrote template config.yaml as-is.")
    raise SystemExit(0)

template = yaml.safe_load(src) or {}
existing = {}
if dest.exists():
    existing = yaml.safe_load(dest.read_text()) or {}

# Preserve unknown user keys; overlay model + local providers.
merged = dict(existing)
merged["model"] = template.get("model", {})
# Keep a previous default only if user already pointed at MiniMax.
old_model = (existing.get("model") or {})
if str(old_model.get("provider", "")).startswith("minimax"):
    merged["model"]["default"] = old_model.get("default", merged["model"].get("default"))

# Merge named custom providers by name.
by_name = {}
for item in existing.get("custom_providers") or []:
    if isinstance(item, dict) and item.get("name"):
        by_name[item["name"]] = item
for item in template.get("custom_providers") or []:
    by_name[item["name"]] = {**by_name.get(item["name"], {}), **item}
merged["custom_providers"] = list(by_name.values())

merged["local_runtime"] = {
    **(existing.get("local_runtime") or {}),
    **(template.get("local_runtime") or {}),
}
# Do not force-enable managed llama-server if the user already configured it.
if existing.get("local_runtime", {}).get("enabled") is True:
    merged["local_runtime"]["enabled"] = True

aux_old = existing.get("auxiliary") or {}
aux_new = template.get("auxiliary") or {}
merged["auxiliary"] = {**aux_old, **aux_new}

prov_old = existing.get("providers") or {}
prov_new = template.get("providers") or {}
merged["providers"] = {**prov_old, **prov_new}

dest.write_text(yaml.safe_dump(merged, sort_keys=False, allow_unicode=True))
print(f"Wrote {dest}")
PY

ENV_FILE="$HERMES_HOME/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ROOT/env.example" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Created $ENV_FILE from env.example — add MINIMAX_API_KEY then re-run hermes doctor."
else
  chmod 600 "$ENV_FILE" || true
  if ! grep -q '^MINIMAX_API_KEY=' "$ENV_FILE"; then
    printf '\n# MiniMax Token Plan subscription key\nMINIMAX_API_KEY=\n' >> "$ENV_FILE"
    echo "Appended empty MINIMAX_API_KEY= to $ENV_FILE — fill it in."
  fi
fi

if grep -Eq '^MINIMAX_API_KEY=.+' "$ENV_FILE" 2>/dev/null; then
  echo "MINIMAX_API_KEY is set."
else
  echo "MINIMAX_API_KEY is empty. Paste the Token Plan subscription key into $ENV_FILE"
fi

if command -v hermes >/dev/null 2>&1; then
  echo
  echo "Checking local model endpoints (ok if Ollama/llama.cpp are not running yet)..."
  curl -fsS --max-time 2 http://127.0.0.1:11434/v1/models >/dev/null 2>&1 \
    && echo "  Ollama reachable at :11434" \
    || echo "  Ollama not reachable at :11434 (start it, then /model custom:ollama:...)"
  curl -fsS --max-time 2 http://127.0.0.1:8080/v1/models >/dev/null 2>&1 \
    && echo "  llama.cpp reachable at :8080" \
    || echo "  llama.cpp not reachable at :8080"
  echo
  hermes doctor || true
  echo
  echo "Smoke MiniMax with: hermes chat --provider minimax --model MiniMax-M3"
else
  echo "hermes CLI not on PATH. Install: curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash"
fi
