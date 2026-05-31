# CLAUDE HANDOFF — COMPLETE SYSTEM BRIEF
**From:** Perplexity Computer (AI Orchestrator)
**To:** Claude Code (Builder)
**Date:** 2026-05-31 | Branch: `claude/instagram-analytics-prd-qSt5w`
**Store:** studexmeat.myshopify.com | **Owner:** Tumelo Ramaphosa

---

## WHAT YOU NEED TO BUILD

### Single VM Architecture on Fly.io
Everything on ONE machine — `datanetics-app` on Fly.io.

```
fly.io VM: datanetics-app
├── server.js (Express router)
│   ├── GET  /              → serves store (studexmeat customer site)
│   ├── GET  /nexus         → serves management dashboard (password protected)
│   ├── POST /api/shopify/* → Shopify proxy (already built: shopify/route.ts)
│   ├── POST /api/cashclaw  → CashClaw agent endpoint
│   ├── POST /api/charlie   → ElevenLabs voice proxy
│   └── POST /api/agentmail → AgentMail.to proxy
├── public/
│   ├── store/index.html    → Customer-facing store
│   └── nexus/index.html    → Nexus dashboard
└── agents/
    └── cashclaw.js         → Revenue + fulfillment agent (background loop)
```

**Single Dockerfile, single fly.toml, single deploy.**

---

## ALL CONNECTED SERVICES (Perplexity Computer has tokens for all)

### Shopify — studexmeat.myshopify.com
- **Token:** stored as `SHOPIFY_ACCESS_TOKEN` in Fly.io secrets (set this first)
- **API Version:** 2024-01
- **Key endpoints you need:**
  - `GET /admin/api/2024-01/orders.json?status=open&financial_status=paid&fulfillment_status=unfulfilled` → unfulfilled orders
  - `GET /admin/api/2024-01/products.json` → products
  - `GET /admin/api/2024-01/inventory_levels.json` → stock
  - `POST /admin/api/2024-01/orders/{id}/fulfillments.json` → fulfill order
- **CRITICAL:** 10 paid unfulfilled orders right now. CashClaw must alert on these immediately.
- **925 total orders | R4,090,749 lifetime revenue**
- **Shopify connector (Perplexity side):** source_id = `shopify`

### Facebook Pages
- **Page ID:** `108934711902801`
- **App ID:** `1649681979685968` (Studex Content Analyser)
- **Ad Account:** `act_560666565541381`
- **Connector:** source_id = `facebook_pages__pipedream`
- **STATUS: Token expired ~May 27** — user needs to refresh at developers.facebook.com/tools/explorer
- **Composio account ID:** `3193a5d4-d47e-447b-9059-b1444e971b2c`

### Instagram
- **NOT yet linked to Facebook Page** — FB Page Settings → Linked Accounts → Instagram
- **Composio account ID:** `108d0d24-67ed-4f96-9605-ebda529f383f`

### Google Ads
- **Customer ID:** `2234319068` (API format: `customers/2234319068`)
- **Connector:** source_id = `google_ads__pipedream`
- **Status:** Zero live campaigns (to be created)

### Google Analytics 4
- **Property:** `properties/295728486`
- **Connector:** source_id = `google_analytics__pipedream`

### Google Search Console
- **Site:** studexmeat.com
- **Connector:** source_id = `google_search_console__pipedream`

### AgentMail.to
- **Purpose:** AI agent email inbox — Charlie reads + responds to customer emails
- **Where it appears:** Nexus dashboard → Email tab
- **Env var:** `AGENTMAIL_API_KEY` (user to provide)

### ElevenLabs — Charlie Voice Agent
- **Agent name:** Charlie (friendly South African meat expert)
- **Deployed on:** studexmeat.com as floating widget
- **Env var:** `ELEVENLABS_API_KEY` (user to provide via Nexus Settings)
- **Widget:** `<elevenlabs-convai agent-id="...">`

### WhatsApp Business
- **Number:** +27835932577
- **Env var:** `WHATSAPP_ACCESS_TOKEN` (user to provide)

### Blotato (Social Publishing)
- **Platforms:** Facebook, Instagram, TikTok, YouTube, LinkedIn, Pinterest
- **Env var:** `BLOTATO_API_KEY` (user to provide)

### n8n Cloud
- **URL:** studexgroup.app.n8n.cloud
- **12 workflows already built**

### Supabase
- **Purpose:** Persistent DB for CashClaw memory, agent logs, customer data
- **Connector:** source_id = `supabase`
- **Env var:** `SUPABASE_URL` + `SUPABASE_ANON_KEY`

### Fly.io
- **Apps:** `datanetics-app` (main), `studex-n8n-runner` (n8n)
- **VM:** 35.196.24.245 (Ubuntu 24.04 — DO NOT STOP, Manus agent running)
- **TLS build workaround:** `flyctl auth docker` → `docker buildx build --platform linux/amd64 -t registry.fly.io/datanetics-app:latest . --push` → `flyctl deploy --image registry.fly.io/datanetics-app:latest`

### Vercel (alternative hosting)
- **Connector:** source_id = `vercel`
- **CLI:** `npx vercel --token $VERCEL_TOKEN` | api_credentials=["vercel"]

---

## CASHCLAW AGENT — WHAT IT DOES

CashClaw is the revenue agent. It runs as a background process inside the VM.

### Phase 0 — Fulfillment Crisis (URGENT, run immediately)
10 paid but unfulfilled orders exist:

| Order | Customer Initials | Amount ZAR | Days Waiting |
|-------|----------|-----------|-------------|
| #1941 | H.M. | R552 | 4 |
| #1940 | L.N. | R3,220 | 19 |
| #1939 | I.H. | R1,610 | 22 |
| #1938 | S.S. | R2,932 | 33 |
| #1937 | M.P. | R3,220 | 36 |
| #1936 | N.M. | R1,552 | 38 |
| #1935 | N.H. | R4,542 | 43 |
| #1932 | T.S. | R3,858 | 47 |
| #1922 | W.K. | R86,250 | 84 |
| #1925 | N.N. | R74,180 | ~84 |

**Total outstanding: ~R181,916**

CashClaw must:
1. Check Shopify every 30 min for new unfulfilled paid orders
2. Alert via Nexus dashboard + Slack notification if any found
3. Show fulfillment action buttons in Nexus Orders tab

### Phase 1 — Revenue Growth (after crisis resolved)
- Cart abandonment emails via AgentMail
- Post-purchase upsell sequences
- Google Ads campaign suggestions
- Weekly sales report generation

---

## NEXUS DASHBOARD — WHAT TO BUILD

Reference design: `studex-nexus-command-2.html` (in repo)
Design system: Dark obsidian (#0D0D0D) + Gold (#C9A84C), Bebas Neue + Space Mono + Cormorant Garamond

### Tabs to build:
1. **Overview** — Revenue widget, order count, fulfillment alerts, GA4 sessions, Facebook fans
2. **Orders** — Order table (initials only, mono R values, privacy toggle `••••••`), fulfill action button
3. **Content** — Content generator (platform + type + model), calendar, scheduler
4. **Ads** — Google Ads campaigns table, Meta Ads summary
5. **Agents** — CashClaw status + loop log, Charlie chatbot config (ElevenLabs agent ID input), 2nd Brain activity feed
6. **Email** — AgentMail.to inbox, incoming emails, AI draft replies, send button
7. **Settings** — All API key inputs: Shopify, ElevenLabs, AgentMail, WhatsApp, Blotato, Meta, CashClaw

### Privacy Rules (MANDATORY):
- Customer names: initials only (e.g. "T.R.")
- All monetary values: `font-family: 'Space Mono', monospace`
- Privacy toggle button: masks all numbers as `••••••` site-wide

### Data endpoints (all proxied through your server.js):
- `POST /api/shopify/orders` → live orders
- `POST /api/shopify/products` → products
- `POST /api/cashclaw/status` → agent status + last loop
- `POST /api/agentmail/inbox` → email inbox
- `GET /api/charlie/config` → chatbot config

---

## CHARLIE — VOICE AGENT ON STORE

Charlie is a friendly, knowledgeable South African meat expert.

**Personality:** Warm, confident, knows every cut. Speaks like someone who braais every weekend. Suggests recipes, upsells premium cuts, explains sourcing.

**What Charlie does:**
- Answers product questions ("What's the difference between Wagyu and Ankole?")
- Recommends cuts based on occasion ("I'm having 8 guests for a braai")
- Upsells from standard to premium ("For that occasion, our Tomahawk would be perfect")
- Captures lead info ("Can I get your email to send you our monthly specials?")

**ElevenLabs setup:**
1. Create agent at elevenlabs.io with Charlie's personality
2. Copy agent-id → paste in Nexus → Agents → Charlie Config
3. Nexus saves it → widget on store updates via env var

---

## AUTOMATION SCHEDULE (all 4 running in parallel)

| Schedule | What | Runs On |
|----------|------|---------|
| Daily 00:00 SAST | Midnight vault log + Shopify + Facebook | Perplexity Computer (cron b8b94cbb) |
| Daily 12:00 SAST | Midday pulse check | Perplexity Computer (cron 698c71cc) |
| Every 6h | 2nd Brain agent activity update | CashClaw → Supabase → Nexus feed |
| Every Monday 07:00 SAST | 7-day content queue | Perplexity Computer (to be created) |

Mac Mini mirrors all 4 as local crontab backup.
Google Calendar has all 4 as recurring events.

---

## SIGNAL PROTOCOL (how we hand off)

**Perplexity Computer → Claude Code:**
- Push spec files to `claude/instagram-analytics-prd-qSt5w` branch
- Claude reads CLAUDE-HANDOFF-COMPLETE.md on startup

**Claude Code → Perplexity Computer:**
- Create `.perplexity-ready/CLAUDE-RESPONSE.md` on branch with what was built
- Perplexity polls branch every midnight cron

**Current Claude response:** `.perplexity-ready/CLAUDE-RESPONSE.md` already exists — Claude confirmed dashboard built, Composio wired, cream-gold palette chosen.

---

## ENV VARS NEEDED ON FLY.IO (datanetics-app)

```bash
flyctl secrets set \
  SHOPIFY_ACCESS_TOKEN=<from Tumelo> \
  SHOPIFY_STORE_DOMAIN=studexmeat.myshopify.com \
  ELEVENLABS_API_KEY=<from Tumelo> \
  AGENTMAIL_API_KEY=<from Tumelo> \
  WHATSAPP_ACCESS_TOKEN=<from Tumelo> \
  BLOTATO_API_KEY=<from Tumelo> \
  META_ACCESS_TOKEN=<from Tumelo — refresh at developers.facebook.com> \
  SUPABASE_URL=<from Tumelo> \
  SUPABASE_ANON_KEY=<from Tumelo> \
  NEXUS_PASSWORD=<set a password for dashboard access> \
  --app datanetics-app
```

---

## FILES ALREADY IN REPO

- `studex-frontend/app/api/shopify/route.ts` — 12 Shopify actions
- `PERPLEXITY-COMPUTER-INTEGRATION-BRIEF.md` — service overview
- `DEPLOY-AND-SECRETS-BRIEF.md` — Fly.io secrets + TLS workaround
- `CLAUDE-MESSAGE.md` — previous handoff
- `.perplexity-ready/CLAUDE-RESPONSE.md` — Claude's previous response

## NEW FILES BEING PUSHED NOW

- `CASHCLAW-AGENT-BRIEF.md` — Full CashClaw spec + Phase 0 crisis protocol
- `DASHBOARD-FINAL-SPEC.md` — Dashboard spec with real API shapes
- `CLAUDE-HANDOFF-COMPLETE.md` — This file

---

*Generated by Perplexity Computer | 2026-05-31 | studex-computer session*
