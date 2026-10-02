# Agent stack: Hermes + OpenClaw on Orgo

Full mesh (two sites, Herdr, OpenRouter, GCP, Mac mini) is in
[`../CONNECTION-PLAN.md`](../CONNECTION-PLAN.md). Live Drive folder IDs are in
[`../DRIVE-MAP.md`](../DRIVE-MAP.md). This folder is only the laptop scripts.

OpenClaw on the laptop listens on **`:18789`**. Probe: `curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:18789/`.

This folder is the wiring for the local Hermes session and the ClawX OpenClaw
gateway. Run these scripts **on your laptop**, not in this Cursor cloud VM.

| Goal | Where it runs | Script |
| --- | --- | --- |
| MiniMax Token Plan + local models on Hermes | Laptop (`~/.hermes`) | `hermes/apply-local.sh` |
| Snapshot ClawX OpenClaw state | Laptop | `openclaw/backup-clawx.sh` |
| Move that snapshot onto an Orgo VM | Laptop with `ORGO_API_KEY` | `openclaw/migrate-to-orgo.sh` |
| Collect Vercel / Cloudflare IDs | Laptop after `vercel login` / `wrangler login` | `cloud/collect-ids.sh` |
| Dispatch one Cursor Cloud Agent (implementer) | Laptop / Mac Mini with `CURSOR_API_KEY` | `factory/dispatch-cursor.sh` (dry-run unless `--go`) |
| List Cursor Cloud Agents | Laptop | `factory/status-cursor.sh` |
| Print / validate a Foreman station | Laptop | `factory/run-line.sh classifier` |
| Clone eve Foreman as a sibling repo | Mac Mini after `vercel login` | `factory/bootstrap-foreman.sh` |

## Why this Cursor session cannot finish the last mile

This agent is already on a Cursor cloud VM. It does **not** have your laptop's
`~/.hermes`, ClawX install, MiniMax subscription key, Orgo key, or a logged-in
Vercel / Cloudflare CLI. Interactive `vercel login` / `wrangler login` cannot
complete here. The scripts below are what you run locally, then paste the
outputs back if you want this agent to wire deploys.

## 1. Hermes: MiniMax subscription + local models

MiniMax Token Plan subscription keys are **not** the same as MiniMax pay-as-you-go
API keys. Get the subscription key from the Token Plan page, then:

```bash
# on your laptop
cd ops/agent-stack/hermes
cp env.example ~/.hermes/.env   # only if you do not already have ~/.hermes/.env
# edit ~/.hermes/.env and set MINIMAX_API_KEY=<Token Plan subscription key>
chmod 600 ~/.hermes/.env
./apply-local.sh
hermes doctor
hermes chat --provider minimax --model MiniMax-M3
```

Inside an existing Hermes chat, switch without leaving:

```
/model MiniMax-M3
/model custom:ollama:<name-from-ollama-list>
/model custom:llamacpp:<name-from-llama-server>
```

Default routing after apply:

- **Main agent** → MiniMax-M3 (Token Plan / global endpoint)
- **Auxiliary** (titles, compression) → MiniMax-M2.7-highspeed
- **Local Ollama** at `http://127.0.0.1:11434/v1`
- **Local llama.cpp** at `http://127.0.0.1:8080/v1`

OAuth alternative (no Token Plan key): `hermes model` → **MiniMax (OAuth)**.
That path ignores `MINIMAX_API_KEY`.

## 2. OpenClaw: ClawX → Orgo VM

ClawX keeps OpenClaw state in `~/.clawx/openclaw` (isolated). System OpenClaw
uses `~/.openclaw`. The backup script detects both.

```bash
# on your laptop — STOP ClawX first so SQLite is quiet
./ops/agent-stack/openclaw/backup-clawx.sh
# writes ~/Backups/openclaw/openclaw-state.tgz

export ORGO_API_KEY=sk_live_...          # https://www.orgo.ai/start
export WORKSPACE_ID=...                  # Orgo workspace id
# Host the tarball somewhere the VM can curl (private GitHub raw, presigned S3).
# /files/upload is capped at 10 MB; typical OpenClaw state is larger.
export STATE_URL='https://...'

./ops/agent-stack/openclaw/migrate-to-orgo.sh
```

Critical after cutover:

- Do **not** leave ClawX's gateway running on the same Slack/Telegram/Discord token.
- WhatsApp / iMessage / Signal pairings are device-bound. Re-scan QR on Orgo.
- Orgo has no public inbound hostname. Use Slack Socket Mode / Telegram long-poll,
  or the authenticated proxy `https://www.orgo.ai/api/desktops/{id}/proxy/`.

Minimum Orgo size: **8 GB RAM / 4 CPU / 32 GB disk**. Browser-heavy skills: 16 GB.

## 3. Vercel + Cloudflare IDs for studex-group.com

```bash
npm i -g vercel wrangler
vercel login
wrangler login
./ops/agent-stack/cloud/collect-ids.sh
```

Paste the generated `ops/agent-stack/cloud/ids.env` (no secrets) back into this
chat and this agent can wire project/zone IDs into deploy config.
