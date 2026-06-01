# FULL-BUILD-BRIEF.md
## StudEx — The Full Build (two VMs + Mission Control dashboard)
## Hand this to: the agent responsible for INFRA + DASHBOARD build
## Date: 2026-06-01

> This is the end-to-end build: provision both VMs, deploy the right containers
> to each, stand up live terminals, and build the **Mission Control** dashboard
> that shows both VMs as screens with per-agent terminals, chats, and connection
> editors.
>
> Companion doc: `AGENTS-BRIEF.md` (defines each agent). Read both.

---

## GOAL — what we're building

```
                  ┌─────────────────────────────────────────────┐
                  │   DASHBOARD: studexmeat.com/command-center    │
                  │   "MISSION CONTROL" — both VMs as screens     │
                  │  ┌──────────────────┐  ┌──────────────────┐  │
                  │  │ SCREEN 1: FLY.IO │  │ SCREEN 2: MANUS   │  │
                  │  │ store + ops      │  │ content + GPU     │  │
                  │  └──────────────────┘  └──────────────────┘  │
                  └──────────────┬───────────────┬───────────────┘
                       terminals + REST + chat
              ┌────────────────┘               └────────────────┐
              ▼                                                  ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│  FLY.IO VM (JNB)              │◄── API ───────►│  MANUS VM (35.196.24.245, GPU)│
│  app:3000 (store + dashboard) │   calls        │  hermes-agent:3004            │
│  cashclaw /api/agent          │                │  ollama:11434 (qwen3/hermes3) │
│  mcp-meta-ads:3002            │                │  comfyui (SDXL / Wan2 video)  │
│  n8n-runner:3003              │                │  manus agent (orchestrator)   │
│  + your "super agents" set    │                │  GPU image/video rendering    │
└───────────────────────────────┘               └───────────────────────────────┘
```

**Division of labor (why both VMs):**
- **Fly.io** = always-on store + dashboard + ops agents (CashClaw, Meta Ads, n8n) + your super-agents. Customer-facing, HTTPS, JNB latency.
- **Manus** = GPU content studio (Hermes + Ollama + ComfyUI + Manus). Local models = free generation.

---

## PART 1 — SPLIT THE DEPLOY (two compose files)

The repo currently has ONE `docker-compose.yml` with all 4 services on an internal
bridge. Split it so each VM runs only its half. They communicate over public URLs.

### Create `docker-compose.fly.yml` (Fly.io VM)
Services: `app` (:3000), `mcp-meta-ads` (:3002), `n8n-runner` (:3003).
- Keep internal URLs for siblings on this VM:
  `META_ADS_MCP_URL=http://mcp-meta-ads:3002`, `N8N_RUNNER_URL=http://n8n-runner:3003`
- Point Hermes at Manus: `HERMES_AGENT_URL=http://<MANUS_IP>:3004`
- Remove the `hermes-agent` service and its `depends_on` entry.

### Create `docker-compose.manus.yml` (Manus VM)
Services: `hermes-agent` (:3004) (+ ollama, comfyui if containerized).
- `CASHCLAW_URL=https://datanetics-app.fly.dev/api/agent`
- `OLLAMA_URL=http://host.docker.internal:11434`
- Add a `terminal` service (see Part 3).

> Keep the original `docker-compose.yml` for single-box local dev. The two split
> files are for production across the two VMs.

---

## PART 2 — PROVISION THE VMs

### Fly.io VM (store + ops)  — region `jnb`
`fly.toml` already targets app `datanetics-app`, region `jnb`, 2gb/2cpu.
```bash
# from repo root
flyctl deploy                          # builds Dockerfile, deploys app
# set secrets (see AGENTS-BRIEF "Fly.io VM" list)
flyctl secrets set SHOPIFY_ACCESS_TOKEN=... META_ACCESS_TOKEN=... ANTHROPIC_API_KEY=... \
  OPENROUTER_API_KEY=... COMPOSIO_API_KEY=... N8N_API_KEY=... QUICKBOOKS_ACCESS_TOKEN=... \
  SLACK_WEBHOOK_URL=... DISCORD_WEBHOOK_URL=...
# IMPORTANT for always-on dashboard: do NOT let it sleep
#   in fly.toml set: min_machines_running = 1 , auto_stop_machines = "off"
```
For the multi-container ops services on Fly, either run a Docker-in-VM machine with
`docker compose -f docker-compose.fly.yml up -d`, OR deploy each service as its own
Fly app using the per-service `fly.toml` files. Pick one and document it.

### Manus VM (content + GPU)  — `35.196.24.245`
```bash
ssh into the Manus VM
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
git clone https://github.com/TumeloRamaphosa/Stud-Ex-Global-Markets-.git
cd Stud-Ex-Global-Markets-
# ensure GPU + Ollama present:
ollama pull hermes3:8b && ollama pull qwen3
# (ComfyUI running on host or as container with --gpus all)
cat > .env <<'EOF'
LLM_PROVIDER=ollama
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=hermes3:8b
CASHCLAW_URL=https://datanetics-app.fly.dev/api/agent
ANTHROPIC_API_KEY=...
OPENROUTER_API_KEY=...
SLACK_WEBHOOK_URL=...
DISCORD_WEBHOOK_URL=...
EOF
docker compose -f docker-compose.manus.yml up -d --build
```

---

## PART 3 — LIVE TERMINALS (per VM + per agent)

Run a lightweight terminal service on **each** VM so the dashboard can embed a
real shell. Recommended: **ttyd** (single binary, WebSocket, works in browser).

On each VM:
```bash
# VM-level terminal (controls the whole box)
ttyd -p 7681 -W bash            # -W = writable; put behind auth/HTTPS

# Per-agent terminals = scope ttyd to one container:
ttyd -p 7682 -W docker exec -it app sh           # CashClaw (Fly)
ttyd -p 7683 -W docker exec -it mcp-meta-ads sh  # Meta Ads (Fly)
ttyd -p 7684 -W docker exec -it n8n-runner sh    # n8n (Fly)
ttyd -p 7685 -W docker exec -it hermes-agent sh  # Hermes (Manus)
```
Protect every ttyd port with a token/basic-auth and TLS. The dashboard embeds each
as an `<iframe>` or via `xterm.js` over the WebSocket. For "logs only" use
`docker logs -f <container>` instead of an interactive shell.

> Alternative if you want full theming/auth control: a small `node-pty + ws`
> service instead of ttyd. Same contract: one WS endpoint per VM and per container.

---

## PART 4 — METRICS (the green ● ONLINE + CPU/RAM/GPU)

Tiny metrics endpoint on each VM, polled by the dashboard every ~5s:
```
GET http://<vm>:9100/metrics  →
{ online:true, cpu:0.24, mem:{used:1.2,total:4}, gpu:{util:0.67,vram:{used:9,total:16}}, containers:[
  { name:"app", state:"running", health:"ok" }, ... ] }
```
Use a 30-line Node/Express service reading `os`, `nvidia-smi` (Manus), and
`docker ps --format json`. GPU block is null on Fly.io.

---

## PART 5 — THE MISSION CONTROL DASHBOARD

Build at `studex-frontend/app/command-center/page.tsx` (folder already exists).
Keep the cream-gold theme (`#FFF8F0` bg, `#D4A017` gold). Layout = **two VM screens**.

### Each VM screen (component `<VMScreen vm="fly|manus" />`)
```
┌─ SCREEN: <VM NAME> ─────────  ● ONLINE  CPU 24%  RAM 1.2/4GB [ GPU 67% ] ─┐
│  [ VM TERMINAL ]  ← ttyd iframe to the VM-level shell (port 7681)         │
│                                                                          │
│  AGENTS ON THIS VM:  (one <AgentCard> per agent)                         │
│  ┌─ <AgentCard agent="cashclaw"> ─────────────────────────────────────┐ │
│  │ 🤖 CashClaw   ● running   /api/agent                                │ │
│  │  ┌ terminal (ttyd iframe) ┐  ┌ chat (POST /chat) ───────────────┐  │ │
│  │  └────────────────────────┘  └──────────────────────────────────┘  │ │
│  │  CONNECTIONS (GET /connections):                                    │ │
│  │   [Shopify ✓][Meta ✓][QuickBooks ✓][Slack ✓]                       │ │
│  │   [ + Add/Edit API key ] [ + Add tool ] [ 📎 Paste link/doc ]      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│  …repeat AgentCard for each agent on this VM…                            │
└──────────────────────────────────────────────────────────────────────────┘
```
- Render two `<VMScreen>` side by side: Fly (cashclaw, meta-ads, n8n) and Manus (hermes, ollama, comfyui, manus).
- **Terminal** = embed the ttyd WS for that VM / container.
- **Chat** = textbox → `POST <agent>/chat` → render reply (stream if available).
- **Connections panel** = `GET <agent>/connections`; ✓ green if connected.
- **Add/Edit API key** = modal → `POST /api/admin/secrets { vm, agent, key, value }`
  → writes to Fly secrets / Manus `.env` → restarts only that container.
- **Add tool** = register a tool/MCP endpoint for that agent.
- **Paste link/doc** = `POST /api/admin/context { vm, agent, url|file }` → drops the
  asset into the agent's context dir so it can use it immediately.

### New API routes to add (in `studex-frontend/app/api/admin/`)
```
GET  /api/admin/vms                 → list VMs + metrics (proxies :9100)
GET  /api/admin/agents              → all agents, which VM, health, connections
POST /api/admin/secrets             → set/update an env var, restart container
POST /api/admin/context             → attach a link/document to an agent
POST /api/admin/chat                → proxy to <agent>/chat
GET  /api/admin/terminal-url        → signed ttyd URL for a VM/agent
```
All admin routes must require auth (reuse the existing `/app/login`).

---

## BUILD ORDER
1. Split compose into `docker-compose.fly.yml` + `docker-compose.manus.yml`.
2. Deploy Fly.io (set `min_machines_running=1`), set secrets. Verify store loads.
3. Provision Manus VM, pull Ollama models, `docker compose -f docker-compose.manus.yml up -d`.
4. Run ttyd terminals + `:9100` metrics on both VMs (behind auth/TLS).
5. Build `<VMScreen>` + `<AgentCard>` + admin API routes.
6. Wire connections panel, secret editor, paste-link/doc, per-agent chat + terminal.
7. Confirm Hermes→CashClaw round-trip across the two VMs.

## DEFINITION OF DONE
- [ ] `studexmeat.com/command-center` shows BOTH VM screens, live ● status.
- [ ] Each VM screen has a working VM terminal.
- [ ] Each agent card has: terminal, chat, connections panel.
- [ ] Add/Edit API key works and restarts only that agent's container.
- [ ] Paste link/doc reaches the agent's context.
- [ ] Fly store is always-on; Manus content round-trips back to CashClaw.
