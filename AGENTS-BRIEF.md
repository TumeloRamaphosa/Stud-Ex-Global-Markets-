# AGENTS-BRIEF.md
## StudEx — The Agents (who they are, where they live, what they connect to)
## Hand this to: the agent responsible for the AGENTS layer
## Date: 2026-06-01

> This brief defines every agent in the StudEx system, which VM it runs on,
> its port/endpoint, the APIs & tools it connects to, and how its per-agent
> **terminal** and **chat** work in the Mission Control dashboard.
>
> Companion doc: `FULL-BUILD-BRIEF.md` (the infra + dashboard build). Read both.

---

## THE TWO-VM MODEL (how it works)

```
┌─────────────────────────────┐         ┌──────────────────────────┐
│  FLY.IO VM (JNB)            │         │  MANUS VM (GCP + GPU)    │
│  ─────────────────────      │◄───────►│  ──────────────────      │
│  • Website / store :3000    │  API    │  • Hermes :3004          │
│  • CashClaw  /api/agent     │  calls  │  • Ollama (qwen3/hermes3)│
│  • n8n-runner :3003         │         │  • ComfyUI (SDXL/Wan2)   │
│  • Meta Ads :3002           │         │  • Manus agent           │
│  Always-on, customer-facing │         │  Heavy content compute   │
└─────────────────────────────┘         └──────────────────────────┘
```

- **Fly.io VM** = always-on, HTTPS, customer-facing. Runs the store, dashboard,
  and the "ops" agents. Never sleeps.
- **Manus VM** (`35.196.24.245`, has the GPU) = content studio. Runs Hermes +
  local models so image/video generation costs **nothing per token**.
- They talk over the public API. Hermes already has `CASHCLAW_URL` wired to reach
  the Fly.io app. When split across machines, that becomes the Fly.io public URL
  (e.g. `https://datanetics-app.fly.dev/api/agent`) instead of the internal one.

---

## AGENT ROSTER

### 1. CashClaw — Business Ops Agent  ★ runs on FLY.IO
- **Endpoint:** `POST https://datanetics-app.fly.dev/api/agent` (code at `studex-frontend/app/api/agent/route.ts`)
- **Job:** the operational brain — reads Shopify orders, flags unfulfilled paid
  orders, watches inventory, triggers invoicing, posts alerts to Slack/Discord.
- **Connections (APIs/tools):**
  - Shopify (`SHOPIFY_ACCESS_TOKEN`, store `studexmeat.myshopify.com`)
  - Meta / Facebook (`META_ACCESS_TOKEN`, ad acct `act_560666565541381`)
  - QuickBooks (`QUICKBOOKS_*`)
  - AgentMail (`AGENTMAIL_API_KEY`)
  - Composio (Instagram, Gmail, Discord) (`COMPOSIO_API_KEY`)
  - LLMs: Anthropic, OpenRouter, Google AI, Perplexity
  - Channels out: Slack webhook, Discord webhook
  - Calls sibling services: `mcp-meta-ads:3002`, `n8n-runner:3003`, `hermes-agent:3004`
- **Terminal:** `docker exec -it app sh` then `tail -f` logs / run node scripts.
- **Chat:** POST `{ "message": "..." }` to `/api/agent` → streams reply.

### 2. Hermes — Content Agent  ★ runs on MANUS (GPU)
- **Endpoint:** `POST http://<manus-ip>:3004` (code at `hermes-agent/src/index.js`)
- **Job:** writes social captions, email copy, video scripts, image prompts;
  generates images (SDXL) and video (Wan2/LTX) via local ComfyUI; drafts content
  then hands finished assets to CashClaw via `CASHCLAW_URL`.
- **Connections (APIs/tools):**
  - **Ollama** local (`OLLAMA_URL=http://host.docker.internal:11434`, model `hermes3:8b` / `qwen3`)
  - **ComfyUI** local (SDXL image, Wan2 / LTX video) — GPU
  - LM Studio (optional, `LM_STUDIO_URL`)
  - Cloud fallback LLMs: Anthropic, OpenRouter, Google AI, Perplexity
  - `CASHCLAW_URL` → posts finished content back to Fly.io app
  - Channels out: Slack webhook, Discord webhook
- **Terminal:** `docker exec -it hermes-agent sh`; GPU box also has `ollama list`, ComfyUI logs.
- **Chat:** POST `{ "task": "write 5 wagyu reel captions" }` to `:3004`.

### 3. Meta Ads MCP  ★ runs on FLY.IO
- **Endpoint:** `:3002` (code at `mcp-meta-ads/src`)
- **Job:** Express proxy for Meta/Facebook Ads Graph API (campaigns, insights, spend).
- **Connections:** `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID=act_560666565541381`.
- **Terminal:** `docker exec -it mcp-meta-ads sh`.
- **Chat:** REST tool calls (not conversational) — `POST :3002/...` actions.

### 4. n8n Runner  ★ runs on FLY.IO
- **Endpoint:** `:3003` (code at `n8n-runner/src`)
- **Job:** invoice automation bridge — Google Sheets → QuickBooks → Drive → Email;
  connects to `studexgroup.app.n8n.cloud`.
- **Connections:** `N8N_API_KEY`, `N8N_BASE_URL`, `GOOGLE_SHEET_ID`, `QUICKBOOKS_*`, `APP_URL`.
- **Terminal:** `docker exec -it n8n-runner sh`.
- **Chat:** REST trigger calls.

### 5. Manus Agent  ★ runs on MANUS
- **Job:** the orchestrator on the GPU box — drives Hermes + ComfyUI + Ollama,
  can run long content/render jobs, talks to Fly.io agents over the API.
- **Terminal:** native VM shell (it owns the box).
- **Chat:** Manus's own interface; also reachable via Hermes.

---

## PER-AGENT DASHBOARD CONTRACT (what each agent must expose)

For the Mission Control dashboard to give every agent a **terminal + chat +
connections panel**, each agent must expose these (the build agent wires the UI):

```
GET  /health            → { status:"ok", uptime, version }
GET  /connections       → [{ name:"Shopify", connected:true, env:"SHOPIFY_ACCESS_TOKEN" }, ...]
POST /chat              → { reply:"..." }   (or stream)   ← used by the chat box
GET  /logs?tail=200     → recent log lines  (or use `docker logs -f` via VM terminal)
```

- **Terminal** = dashboard runs `docker exec`/`docker logs -f <container>` scoped to
  this one agent through the VM's terminal service (see FULL-BUILD-BRIEF).
- **Connections panel** = renders `GET /connections`. Each row has:
  `[ Add/Edit key ]` (writes the env var → restarts just this container),
  `[ Add tool ]`, `[ 📎 Paste link/doc ]` (drops a file into the agent's context dir).

---

## SECRETS EACH AGENT NEEDS (set on the VM that runs it)

**Fly.io VM** (`flyctl secrets set` or `.env`):
```
SHOPIFY_ACCESS_TOKEN, META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, FACEBOOK_APP_ID,
ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, OPENROUTER_API_KEY, PERPLEXITY_API_KEY,
COMPOSIO_API_KEY, QUICKBOOKS_* , AGENTMAIL_API_KEY, N8N_API_KEY,
SLACK_WEBHOOK_URL, DISCORD_WEBHOOK_URL
```

**Manus VM** (`.env`):
```
LLM_PROVIDER=ollama, OLLAMA_URL, OLLAMA_MODEL, LM_STUDIO_URL,
ANTHROPIC_API_KEY, OPENROUTER_API_KEY, GOOGLE_AI_API_KEY, PERPLEXITY_API_KEY,
SLACK_WEBHOOK_URL, DISCORD_WEBHOOK_URL,
CASHCLAW_URL=https://datanetics-app.fly.dev/api/agent
```

---

## DEFINITION OF DONE (agents layer)
- [ ] Every agent answers `GET /health` and `GET /connections`.
- [ ] CashClaw reachable at the public Fly.io URL; Hermes reachable at Manus `:3004`.
- [ ] Hermes can POST a finished asset to `CASHCLAW_URL` and CashClaw acknowledges.
- [ ] Each agent's secrets are set on the correct VM and `/connections` shows ✓.
- [ ] Per-agent chat returns a reply; per-agent terminal streams logs.
