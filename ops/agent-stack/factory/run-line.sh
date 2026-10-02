#!/usr/bin/env bash
# Print or validate one Foreman station. Does not call Cursor.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
STATION="${1:-}"
JSON="${2:-}"

usage() {
  echo "Usage: $0 classifier|analyst|implementer|reviewer [output.json]"
  echo "  no JSON  → print the station prompt + schema path"
  echo "  with JSON → require Foreman keys, then exit 0/1"
}

case "$STATION" in
  classifier|analyst|implementer|reviewer) ;;
  -h|--help|"") usage; exit 0 ;;
  *) echo "unknown station: $STATION" >&2; usage; exit 2 ;;
esac

PROMPT="$ROOT/stations/${STATION}.md"
SCHEMA="$ROOT/stations/schemas/${STATION}.schema.json"

if [[ -z "$JSON" ]]; then
  echo "# station=$STATION"
  echo "# prompt=$PROMPT"
  echo "# schema=$SCHEMA"
  echo
  sed -n '1,12p' "$PROMPT"
  echo "..."
  exit 0
fi

python3 - "$SCHEMA" "$JSON" <<'PY'
import json, sys
schema_path, data_path = sys.argv[1], sys.argv[2]
schema = json.loads(open(schema_path).read())
data = json.loads(open(data_path).read())
missing = [k for k in schema.get("required", []) if k not in data]
if missing:
    print("missing keys:", ", ".join(missing), file=sys.stderr)
    raise SystemExit(1)
enums = []
for key, spec in schema.get("properties", {}).items():
    if key in data and "enum" in spec and data[key] not in spec["enum"]:
        enums.append(f"{key}={data[key]!r} not in {spec['enum']}")
if enums:
    print("enum errors:", "; ".join(enums), file=sys.stderr)
    raise SystemExit(1)
print("ok", data_path)
PY
