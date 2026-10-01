# StudEx connection plan

Inventory of the three repos plus this workspace, then the order to bring **two public sites** up, then **Herdr + OpenRouter**, then **GCP / Orgo / Mac mini** as one mesh.

Read this before adding more dashboards, VMs, or agents. The MacBook is already disk- and RAM-bound. New compute goes to the Mac Mini, an existing Orgo desk, or an existing GCP VM — not a sixth cloud.

**Live Google Drive command centers** (18 folder IDs, Agentcyberpunk7 Drive) are in [`DRIVE-MAP.md`](DRIVE-MAP.md). Drive is shared memory. OpenClaw on the laptop is `:18789`. Tango is the human board. Do not copy Drive onto the MacBook.

**Software factory** (24/7 loop on Hermes, Cursor Cloud Agents as workers) is [`SOFTWARE-FACTORY.md`](SOFTWARE-FACTORY.md). Dispatcher scripts: `ops/agent-stack/factory/`.

---

## What the names mean

| You said | In the repos / industry | Role |
| --- | --- | --- |
| Herder | **herdr** ([herdr.dev](https://herdr.dev)) | Terminal multiplexer that watches Hermes / Cursor / OpenClaw panes |
| OpenRick | **OpenRouter** (Hermes cookbook) | One API key → many models; Hermes `provider: openrouter` |
| Our-OS | [TumeloRamaphosa/Our-OS](https://github.com/TumeloRamaphosa/Our-OS) | Master OS: relay dashboard, constellation HTML, machine map |
| Auto-Meat | [TumeloRamaphosa/studex-auto-meat](https://github.com/TumeloRamaphosa/studex-auto-meat) | Meat command centre + Shopify connector; shop is already https://studexmeat.com |
| This repo | [stud-ex-global-markets-](https://github.com/tumeloramaphosa/stud-ex-global-markets-) | Global Markets Next.js + Fly nexus + the agent-stack scripts in `ops/` |
| agentic-lab-v3 | **Not found** | `StudEX/agentic-lab-v3` 404s for this token. Closest public labs: `StudEX/StudExHermes-Command`, `StudEX/super-agents`, `StudEX/StudEx-Cognitive-System-`. Need org access or the real URL. |
| eve factory | [vercel-labs/eve-software-factory-template](https://github.com/vercel-labs/eve-software-factory-template) | Foreman: four stations → draft PR. Clone as its own Vercel app later. |
| Portable-agents | [TumeloRamaphosa/Portable-agents](https://github.com/TumeloRamaphosa/Portable-agents) | Mission Control console (P1). Not the coder. |

---

## The two sites to put on the internet first

From `Our-OS/README.md` (explicit Vercel targets):

| Site | Source in repo | Intended hostname | Status in repo |
| --- | --- | --- | --- |
| **NEXUS Relay** | `Our-OS/dashboards-relay/` (Next.js) | `relay.studex-group.com` | Built, **not proven deployed** |
| **Master OS constellation** | `Our-OS/master-os-animation.html` | `os.studex-group.com` | Built, **not proven deployed** |

Shop customers already pay on **https://studexmeat.com**. Do not block site launch on rebuilding Shopify. The Auto-Meat HTML command centre (`Auto-Meat-Command-Centre-ULTIMATE.html`) is a third static deploy if you want operators on Vercel; it is not the customer store.

This workspace’s `ops/command-center/` HTML is a **fourth** operator surface (bare-metal + unified). Keep it off `os` / `relay` hostnames so DNS stays one-to-one with Our-OS.

---

## What already exists (do not recreate)

### Machines (`Our-OS/machines/`)

**MacBook (primary desk)** — `macbook-pro-5` `100.95.66.29`

- ~21 GB free, RAM already tight. No new models, Docker images, or Drive mirrors.
- CashClaw, Hermes profiles, ClawX OpenClaw **`:18789`**, Herdr, OrbStack `studx-dev`, `~/studex-auto-meat`, `~/grokbot-os`.
- Brain telemetry still lists Paperclip `:44783` and OpenMausBot `:8799` on `185.209.179.145` as down (~40 days). Do not revive them with a new VM. Route jobs through Hermes / OpenClaw / existing Orgo.
- Tailscale coordination was blocked by Fortinet when last checked.

**Mac Mini (second desk)** — `projects-mac-mini` `100.112.109.40`

- Always-on candidate for Herdr + Hermes + OpenRouter + relay process `:5555`.
- Must **not** get a second OpenClaw gateway, second OrbStack, or copied Ollama weights from the MacBook until disk is confirmed.

**Orgo (Studex Wildlife workspace, login tumelor001@)** — five already running:

| Computer | Use |
| --- | --- |
| Auto - Meat | Meat command centre / Shopify read |
| Neledi - CMO | Naledi drafts |
| Global Markets | Markets floor |
| Project - 2571: Super Agents Command | Group command |
| Solo - Prenure | Running spare |

Frozen: Rwanda, Ryde 1 RSA, SGM - CLIENTS, NTechLab. Leave frozen until a named job needs one.

**GCP** (project `gen-lang-client-0728429584`) — five already running:

| VM | Zone | Role hint |
| --- | --- | --- |
| studex-factory | Iowa | Factory |
| studex-command | Iowa | Command |
| studex-agent | Iowa | Agent |
| arcade-agents | Johannesburg | Arcade |
| studex-nexus-hub | Johannesburg | Nexus |

### Agents (`Our-OS/agents/registry.md`)

Nine named seats: Naledi, OpenClaw, CashClaw, Adam, Charlie, EDDIE, RALF, Hermes, Katia. Talking seats draft; service seats do hands. **Publish, payment, theme push, fulfilment wait for a human.**

---

## Target mesh (one picture)

```
Telegram / Buzz / humans
        │
        ▼
Cloudflare DNS + Worker  (studex-group.com)
        │
        ├─► Vercel  os.studex-group.com      (Master OS HTML)
        ├─► Vercel  relay.studex-group.com   (Next relay UI)
        └─► Worker  /api/*  → Tailscale
                         │
          ┌──────────────┼──────────────┬──────────────┐
          ▼              ▼              ▼              ▼
     Mac Mini        MacBook         Orgo desks      GCP VMs
     Herdr           CashClaw        Auto-Meat       factory/
     Hermes          ClawX :18789    Naledi          command/
     OpenRouter      (until cutover) Global Markets  nexus-hub
     :5555 relay     Cursor desk     Super Agents
     Ollama if RAM   Drive MCP
                         │
                         ▼
              Agentcyberpunk7 Drive (18 live hubs)
```

OpenRouter is the **cloud model bus**. MiniMax Token Plan and local Ollama stay as Hermes providers beside it (`/model` switch), not a second gateway.

Shared files live on Drive ([`DRIVE-MAP.md`](DRIVE-MAP.md)): Agent Bus for dispatch, Registry for roster, Brain for daily briefs, Clients folder `#6` for IGH/Raws/Straegy/Bohlale/PwC/UAE/Bitfury. OpenClaw `:18789` reads those folders; it does not join this Cursor chat.

---

## Sequence (do not skip)

### 0. Access

Needed on the **laptop**, not this Cursor cloud VM:

- `vercel login` + `wrangler login` (or Vercel/Cloudflare MCP auth)
- `ORGO_API_KEY` / `orgo computers list`
- `gcloud` on project `gen-lang-client-0728429584`
- `OPENROUTER_API_KEY` in `~/.hermes/.env`
- MiniMax Token Plan key if you still want MiniMax as a named provider
- Org access to `StudEX/agentic-lab-v3` **or** confirm it was renamed

Run `ops/agent-stack/cloud/collect-ids.sh` and paste `ids.env` (IDs only) back into chat.

### 1. Two sites live

Work from a clone of **Our-OS**, not from this Global Markets repo.

1. `cd dashboards-relay && npm install && npm run build` — fix build errors here first.
2. `vercel --prod` with project name `studex-relay-dashboard`. Set `NEXT_PUBLIC_RELAY_URL` only after step 3 has a public relay, or leave it pointing at a later tunnel.
3. Deploy `master-os-animation.html` as a static Vercel project `studex-master-os`.
4. **cloudflare-ops**:  
   - `relay` CNAME → `studex-relay-dashboard.vercel.app`  
   - `os` CNAME → `studex-master-os.vercel.app`  
   Grey-cloud if Vercel TLS fights orange proxy.
5. Smoke: both hostnames return 200. Relay UI may show agents offline until `:5555` exists — that is OK.

Optional parallel: Vercel-deploy `studex-auto-meat` static command centre. Customer checkout stays on Shopify.

### 2. Herdr + OpenRouter on the Mac Mini

MacBook cannot take another always-on agent loop.

On **Mac Mini** (after Tailscale reaches `projects-mac-mini`):

```bash
# Hermes
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
hermes config set OPENROUTER_API_KEY sk-or-...    # writes ~/.hermes/.env
hermes config set model.provider openrouter
hermes config set model.default '~anthropic/claude-sonnet-latest'

# Keep MiniMax + local as extras (from this repo’s template)
# copy ops/agent-stack/hermes/config.yaml custom_providers onto the Mini

# Herdr
# https://herdr.dev — install, then:
herdr integration install hermes
herdr integration install cursor
```

Hermes inside a Herdr pane is the orchestrator. OpenRouter is the brain. Cursor CLI / Cloud Agents stay workers for git repos.

Do **not** start a second OpenClaw gateway on the Mini (Our-OS rule). 24/7 OpenClaw belongs on **one** Orgo computer (Super Agents Command or Auto-Meat), using `ops/agent-stack/openclaw/migrate-to-orgo.sh`, then stop ClawX on the MacBook so tokens do not race.

### 3. Connect Orgo + GCP (no new VMs)

| Job | Where |
| --- | --- |
| Meat Shopify read + command centre process | Orgo **Auto - Meat** + `~/studex-auto-meat` |
| Naledi drafts | Orgo **Neledi - CMO** |
| Markets Next.js / Fly | Orgo **Global Markets** + this repo; Fly app `datanetics-app` already exists |
| Group swarm / Herdr remote panes | Orgo **Super Agents Command** |
| Long jobs, factory | GCP `studex-factory` / `studex-command` |

Turn SSH on per Orgo box only when you need `orgo ssh`. Do not paste desktop URLs into git.

GCP: confirm each VM’s process (docker / systemd) before installing Hermes a sixth time. Prefer one Hermes gateway (Mini or one Orgo) talking to the others over Tailscale.

### 4. Edge bridge

`Our-OS/cloudflare-worker.js` already routes:

- `/api/agents/*` → Herdr relay `:5555` on Tailscale
- `/api/models/*` → Ollama + OpenRouter (“Models House”)
- `/api/buzz/*` → Buzz websocket
- `/api/gcp/*` → GCP
- `/api/email/*` → Workspace

Deploy that Worker **after** Mini `:5555` is up. Until then the Worker is a 502 generator. Cloudflare Tunnel or Tailscale Serve beats exposing 5555 on the public internet.

### 5. Meat loop (human still in the loop)

Already specified in `agents/registry.md`:

1. Customer pays on studexmeat.com  
2. Auto-Meat reads Shopify  
3. Naledi drafts  
4. Mac1-StudEx / CashClaw drafts invoice  
5. Person approves post / charge / fulfilment  

Do not “fully automate” payments. Wire status into Relay so the nine seats show online.

---

## What this Cursor session will not finish

- `vercel login` / `wrangler login` (device OAuth hung here already)
- Reading `file:///Users/tumeloramaphosa/Desktop/*.html`
- Talking to ClawX, Herdr, Ollama, or Orgo without keys
- Cloning `StudEX/agentic-lab-v3` (404)

Scripts already in **this** repo for the laptop:

| Path | Purpose |
| --- | --- |
| `ops/agent-stack/hermes/apply-local.sh` | MiniMax + local providers on Hermes |
| `ops/agent-stack/openclaw/backup-clawx.sh` | Snapshot ClawX |
| `ops/agent-stack/openclaw/migrate-to-orgo.sh` | Restore on Orgo |
| `ops/agent-stack/cloud/collect-ids.sh` | Vercel / Cloudflare IDs |
| `.cursor/agents/vercel-ops.md` | Subagent for site deploys |
| `.cursor/agents/cloudflare-ops.md` | Subagent for DNS / Pages |
| `ops/command-center/` | Operator HTML (not the two public sites) |
| `ops/DRIVE-MAP.md` | Live Drive folder IDs + OpenClaw `:18789` wiring |
| `ops/drive-ids.json` | Same IDs, machine-readable |
| `ops/SOFTWARE-FACTORY.md` | 24/7 factory: Hermes loop + Cursor workers |
| `ops/agent-stack/factory/` | `dispatch-cursor.sh`, Grok handoff prompt |

---

## First operator actions (laptop)

1. `vercel login` and `wrangler login`, then `ops/agent-stack/cloud/collect-ids.sh`.
2. Clone Our-OS on the MacBook, build `dashboards-relay`, ask this chat to “use vercel-ops on Our-OS relay + master-os HTML”.
3. Unlock `StudEX/agentic-lab-v3` or send the renamed URL.
4. Bring Mac Mini on Tailscale; install Hermes + Herdr + OpenRouter there only.
5. Pick **one** Orgo box for OpenClaw 24/7; stop ClawX after cutover.
6. Point OpenClaw / Hermes at the live Drive IDs in `ops/DRIVE-MAP.md` (Clients `#6`, Notion `#2`). Close stale Brain tasks before dispatching new Agent Bus jobs.

When IDs and Our-OS deploy logs are pasted back, the next implementation step is DNS + the two Vercel projects — not more architecture documents.
