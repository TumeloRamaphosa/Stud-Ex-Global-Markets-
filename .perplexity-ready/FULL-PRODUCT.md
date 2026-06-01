# FULL PRODUCT — StudEx Platform
## Claude Code → Perplexity Computer (the full product you're waiting for)
## Date: 2026-06-01 | Branch: claude/instagram-analytics-prd-qSt5w

> This is the consolidated product definition. It reconciles your CLAUDE-MASTER-PLAN
> with the two-VM infra and the 4-builder team. Index of detail docs at the bottom.

---

## WHAT THE PRODUCT IS

**StudEx** — one platform, three surfaces, five agents, three hosts.

```
SURFACES                         AGENTS                        HOSTS
─────────                        ──────                        ─────
1. Customer Store  ┐             CashClaw (ops)      ┐         VERCEL  (web app: store + dashboard)
2. Nexus Dashboard ┼─ Next.js    Charlie  (voice)    ┤         FLY.IO  (always-on agents + domains)
3. Mission Control ┘  app        Meta Ads (ads)      ┼─ run on MANUS  (GPU: content generation)
                                 n8n      (invoices) │
                                 Hermes   (content)  ┘
```

1. **Customer Store** — `studexmeat.com` — mobile-first, Shopify-powered, Charlie voice concierge.
2. **Nexus Dashboard** — internal ops (Shopify + Meta + Google Ads + GA4 + inventory + fulfillment).
3. **Mission Control** — `/command-center` — live view of BOTH VMs as screens, each agent with
   its own terminal + chat + connections editor (set/change API keys, paste links/docs).

---

## DEPLOY MODEL (reconciled — build for THIS)

```
VERCEL ............ customer store + Nexus + Mission-Control dashboard
                    (Next.js frontend + API routes; auto-deploys on push)
   │  API routes proxy to ↓
FLY.IO VM (JNB) ... always-on processes Vercel serverless can't run:
                    CashClaw workers, n8n-runner:3003, mcp-meta-ads:3002, super-agents
MANUS VM (GPU) .... Hermes:3004 + Ollama (qwen3/hermes3) + ComfyUI (SDXL/Wan2) — free local content
```

Your single-Next.js-app-on-Vercel plan stays valid for the web app. Only the
long-running / GPU work moves to the two VMs, reached over their public URLs.

---

## HOSTING / DOMAIN

- **Fly.io for now** — app `datanetics-app` (region `jnb`). Access via the default
  `datanetics-app.fly.dev` URL. Set `min_machines_running=1` so the dashboard never sleeps.
- **Custom domain: later.** No domain migration in scope yet — we'll point one at the
  Fly.io app when we get it. (Existing `studexmeat.com` store is unaffected.)

---

## THE 4 BUILDERS (who delivers what)

| Builder | Delivers |
|---------|----------|
| **Cursor (IDE)** | Polish: lint/type/build green, UI refinement, Firebase auth scaffold, payments |
| **Claude terminal** | Infra: Fly.io + Manus VMs, `docker-compose.{fly,manus}.yml`, ttyd terminals, metrics, domains |
| **GPT** | Agents + debugging: CashClaw, Hermes, Meta Ads, n8n — `/health` `/connections` `/chat` contracts |
| **Claude Code + Tumelo** | Finalize: Mission Control dashboard, `app/api/admin/*`, **auth + security**, ship |

Full lane map + merge rules: `AGENT-COORDINATION.md`.

---

## STATUS

**Done / on branch**
- Shopify API proxy (`/api/shopify`), QuickBooks proxy, platform-data aggregator
- CashClaw agent (`/api/agent`, 10 workflows), AgentMail campaigns
- Facebook MCP server (`mcp-servers/facebook/`)
- Hermes content agent, Meta Ads MCP, n8n runner (containerized)
- Dashboard pages (overview + social), cream-gold theme `#FFF8F0` / `#D4A017`
- Briefs: `AGENTS-BRIEF.md`, `FULL-BUILD-BRIEF.md`, `AGENT-COORDINATION.md`

**In flight**
- Mission Control `/command-center` two-VM screens (Claude Code)
- VM provisioning + compose split + ttyd terminals (Claude terminal)
- Per-agent `/health` `/connections` `/chat` (GPT)
- `next build` green + Firebase auth scaffold (Cursor)

**Blocking / needs Tumelo**
- Live secrets onto Fly.io + Manus (Shopify, Meta, Anthropic, etc.)
- Rotate the leaked `SHOPIFY_TOKEN.txt` (remove from git)
- Refresh expired Facebook token

---

## WHAT PERPLEXITY SHOULD DO NEXT
1. Keep building the **customer store + CashClaw/Charlie API routes** on Vercel (your lane).
2. Use the cream-gold palette (`#FFF8F0` bg, `#D4A017` gold) — confirmed by Tumelo.
3. Target the reconciled deploy model above (Vercel web; VMs for long-running/GPU).
4. Read `AGENT-COORDINATION.md` for lanes so we don't collide on push (pull-before-push).
5. Signal status via `.perplexity-ready/<file>.md` when a piece lands.

---

## DETAIL DOCS (the full product, expanded)
- `AGENT-COORDINATION.md` — team lanes, merge rules, reconciled deploy
- `AGENTS-BRIEF.md` — every agent: VM, port, connections, dashboard contract (→ GPT)
- `FULL-BUILD-BRIEF.md` — two-VM infra + Mission Control dashboard build (→ Claude terminal + Claude Code)
- `CLAUDE-MASTER-PLAN.md` — your store/CashClaw/Charlie plan
- `DASHBOARD-FINAL-SPEC.md` — dashboard data shapes (live Shopify/IG)
- `CASHCLAW-AGENT-BRIEF.md` — CashClaw spec
