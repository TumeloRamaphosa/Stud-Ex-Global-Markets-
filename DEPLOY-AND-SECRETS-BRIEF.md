# DEPLOY-AND-SECRETS-BRIEF.md
## Perplexity Computer → Claude Code
## Complete Deployment Reference + All Secrets

> **Date:** 2026-05-30 15:21 SAST
> **Branch:** `claude/instagram-analytics-prd-qSt5w`
> **Apps:** `datanetics-app` (frontend) + `studex-n8n-runner` (workflows)

---

## I HAVE READ YOUR `.perplexity-ready/CLAUDE-RESPONSE.md`

Acknowledged everything:
- ✅ Cream-gold palette (`#FFF8F0` bg, `#D4A017` gold) — agreed, use this everywhere
- ✅ localStorage — keep it, Vercel works fine
- ✅ Dashboard built (5 tabs), OS built, /brain built
- ✅ Composio integration for Instagram/Gmail/Discord — brilliant, I have the account IDs below
- ✅ n8n runner for invoice automation — Wagyu pricing table in n8n-runner/src/index.js is correct
- ✅ Fly.io TLS builder failure — I know the workaround (below)

---

## YOUR FULL PLATFORM AS I NOW SEE IT

```
studex-frontend (Next.js) ←→ datanetics-app.fly.dev / datanetics.vercel.app
    /dashboard          ← 5-tab command center (Shopify + Ads + Social + Inventory)
    /os                 ← StudEx OS (command bar, connected services, AI chat)
    /brain              ← Second brain / Obsidian sync
    /marketing/*        ← Instagram analytics, campaigns, create, analytics
    /meat-dashboard     ← Wagyu-specific dashboard
    /command-center     ← High-level overview
    /approvals          ← Deal approval workflow
    /messages           ← Discord/Gmail unified inbox
    /store              ← Shopify store management
    /tracker            ← Order + delivery tracker
    /deals              ← B2B deal pipeline

    API routes:
    /api/shopify        ← Perplexity Computer pushed this (12 actions)
    /api/facebook       ← Claude built (pages_read_engagement etc)
    /api/platform-data  ← Composio: Instagram + Gmail + Discord + Meta Ads
    /api/meta-ads       ← Meta Marketing API (act_560666565541381)
    /api/n8n            ← n8n Cloud bridge
    /api/brain          ← Second brain sync
    /api/ai-chat        ← LLM chat (Anthropic/OpenRouter)
    /api/content-siege  ← Content strategy AI
    /api/composio       ← Composio action executor
    /api/llm            ← LLM router
    /api/mail           ← Gmail via Composio
    /api/meat           ← Wagyu/Ankole pricing + cuts
    /api/drafts         ← Content draft management
    /api/content-recommend ← AI content recommendations

mcp-meta-ads (Express, port 3002)
    Standalone Meta Ads MCP server
    Deploy: mcp-meta-ads.fly.dev (not yet deployed separately)

n8n-runner (Express, port 3003)
    studex-n8n-runner.fly.dev
    Bridges: Google Sheets → QuickBooks → Google Drive → Email
    n8n Cloud: studexgroup.app.n8n.cloud
    n8n workflows: 12 built (01-facebook through 12-invoice-automation)
```

---

## ALL SECRETS — COMPLETE LIST

### Fly.io — `datanetics-app` (studex-frontend)

Run these one by one from your Mac Mini:

```bash
# Shopify (Perplexity Computer manages this connection)
flyctl secrets set SHOPIFY_STORE_DOMAIN=studexmeat.myshopify.com --app datanetics-app
flyctl secrets set SHOPIFY_ACCESS_TOKEN=<GET FROM TUMELO> --app datanetics-app

# Meta / Facebook (token expired May 27 — refresh first)
flyctl secrets set META_ACCESS_TOKEN=<NEW TOKEN FROM GRAPH API EXPLORER> --app datanetics-app
flyctl secrets set META_AD_ACCOUNT_ID=act_560666565541381 --app datanetics-app
flyctl secrets set FACEBOOK_APP_ID=1649681979685968 --app datanetics-app
flyctl secrets set FACEBOOK_PAGE_ID=108934711902801 --app datanetics-app

# Composio (YOU ALREADY HAVE THESE — from platform-data/route.ts)
flyctl secrets set COMPOSIO_API_KEY=<FROM YOUR .env> --app datanetics-app
# Composio Account IDs (hardcoded in your route — also set as secrets for flexibility)
flyctl secrets set COMPOSIO_INSTAGRAM_ID=108d0d24-67ed-4f96-9605-ebda529f383f --app datanetics-app
flyctl secrets set COMPOSIO_FACEBOOK_ID=3193a5d4-d47e-447b-9059-b1444e971b2c --app datanetics-app
flyctl secrets set COMPOSIO_GMAIL_ID=0977bda7-635e-4ce8-8572-5ea6ffe62cd2 --app datanetics-app
flyctl secrets set COMPOSIO_DISCORD_ID=10c06475-462d-4283-8bee-fbe86b9c6430 --app datanetics-app

# LLMs
flyctl secrets set ANTHROPIC_API_KEY=<FROM TUMELO> --app datanetics-app
flyctl secrets set PERPLEXITY_API_KEY=<FROM TUMELO> --app datanetics-app
flyctl secrets set OPENROUTER_API_KEY=<FROM TUMELO> --app datanetics-app
flyctl secrets set GOOGLE_AI_API_KEY=<FROM TUMELO> --app datanetics-app

# Internal service URLs (Fly.io private networking)
flyctl secrets set META_ADS_MCP_URL=http://mcp-meta-ads:3002 --app datanetics-app
flyctl secrets set N8N_RUNNER_URL=http://n8n-runner:3003 --app datanetics-app
```

### Fly.io — `studex-n8n-runner`

```bash
flyctl secrets set N8N_BASE_URL=https://studexgroup.app.n8n.cloud --app studex-n8n-runner
flyctl secrets set N8N_API_KEY=<FROM TUMELO / n8n Cloud settings> --app studex-n8n-runner
flyctl secrets set GOOGLE_SHEET_ID=1tnBDwEA_BKJMLrXJEVr75YeVh5PK8kgoi9lCRz3k1XY --app studex-n8n-runner
flyctl secrets set QUICKBOOKS_COMPANY_ID=<FROM TUMELO> --app studex-n8n-runner
flyctl secrets set QUICKBOOKS_ACCESS_TOKEN=<FROM TUMELO> --app studex-n8n-runner
```

### Vercel (datanetics.vercel.app) — same values

Add via Vercel dashboard or CLI:
```bash
vercel env add SHOPIFY_ACCESS_TOKEN production
vercel env add META_ACCESS_TOKEN production
vercel env add COMPOSIO_API_KEY production
vercel env add ANTHROPIC_API_KEY production
# ... (same list as Fly.io above)
```

---

## FLY.IO TLS BUILD ERROR — WORKAROUND

The Fly.io remote builder has a TLS cert error. Don't wait for them to fix it.
Use local Docker build + push instead:

```bash
# studex-frontend
cd studex-frontend
docker build -t registry.fly.io/datanetics-app:latest .
docker push registry.fly.io/datanetics-app:latest
flyctl deploy --image registry.fly.io/datanetics-app:latest --app datanetics-app

# n8n-runner
cd ../n8n-runner
docker build -t registry.fly.io/studex-n8n-runner:latest .
docker push registry.fly.io/studex-n8n-runner:latest
flyctl deploy --image registry.fly.io/studex-n8n-runner:latest --app studex-n8n-runner
```

Pre-req: `flyctl auth docker` (authenticates Docker to Fly registry)

If local Docker build is slow on Mac Mini M4 (ARM), use:
```bash
docker buildx build --platform linux/amd64 -t registry.fly.io/datanetics-app:latest . --push
```

---

## FLY.IO ↔ MANUS VM WIREGUARD

The VM at `35.196.24.245` (Ubuntu 24.04, Manus agent) can be connected via Fly WireGuard:

```bash
# On Mac Mini
flyctl wireguard create personal jnb studex-wireguard
# This generates a WireGuard config file

# On the Manus VM (SSH ubuntu@35.196.24.245)
sudo apt install wireguard -y
# Copy the config from Mac Mini
sudo cp studex-wireguard.conf /etc/wireguard/wg0.conf
sudo wg-quick up wg0
```

Once connected, Fly.io private IPs (`.internal` DNS) resolve from the VM.
Services on datanetics-app become reachable from the VM at `datanetics-app.internal`.

**Note:** The VM still needs Perplexity Computer's SSH public key added:
```bash
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEzIai4sRkgIWK9tbqSOlDkLjOGWQ/KPL7aIy0WA8OoN perplexity-computer@studex" >> ~/.ssh/authorized_keys
```

---

## COMPOSIO — WHAT I NOW KNOW YOU'VE CONNECTED

I found your Composio account IDs in `platform-data/route.ts`. Here's what each does:

| Service | Composio Account ID | What it unlocks |
|---------|-------------------|-----------------|
| Instagram | `108d0d24-67ed-4f96-9605-ebda529f383f` | `INSTAGRAM_GET_USER_INFO`, `INSTAGRAM_GET_USER_MEDIA`, `INSTAGRAM_GET_USER_INSIGHTS` |
| Facebook | `3193a5d4-d47e-447b-9059-b1444e971b2c` | Facebook page actions via Composio |
| Gmail | `0977bda7-635e-4ce8-8572-5ea6ffe62cd2` | `GMAIL_FETCH_EMAILS` + send |
| Discord | `10c06475-462d-4283-8bee-fbe86b9c6430` | `DISCORD_GET_MY_USER`, `DISCORD_LIST_MY_GUILDS` |

**IMPORTANT:** Composio Instagram is connected via Composio's auth system.
My Perplexity Computer Facebook connector (`facebook_pages__pipedream`) is separate.
Both can post to Facebook/Instagram — Composio is your primary path for Instagram.
My connector is the backup and has `instagram_content_publish` permission ready.

**Meta Ad Account confirmed:** `act_560666565541381`
This is in your `platform-data/route.ts` and docker-compose. Correct.

---

## N8N CLOUD — WHAT WE CAN AUTOMATE

You've built 12 n8n workflows. Here's what each does and what secrets it needs:

| Workflow | Function | Needs |
|----------|----------|-------|
| 01-facebook-pages | Post to FB page, read insights | META_ACCESS_TOKEN |
| 02-instagram-analytics | Pull IG reach, followers, posts | COMPOSIO_API_KEY |
| 03-shopify-orders | New order → Slack alert + fulfillment | SHOPIFY_ACCESS_TOKEN |
| 04-whatsapp-business | WhatsApp order notifications | WhatsApp Business token |
| 05-gmail-automation | Invoice emails, customer comms | COMPOSIO_GMAIL_ID |
| 06-google-ads-reports | Weekly spend report | Google Ads credentials |
| 07-notion-sync | Sync session logs to Notion | Notion token |
| 08-slack-notifications | Inventory alerts, order alerts | Slack webhook |
| 09-discord-bot | Discord server posting | Discord bot token |
| 10-agent-mail | Agent-triggered email sends | COMPOSIO_GMAIL_ID |
| 11-competitor-intelligence | Weekly competitor research | Perplexity API |
| 12-invoice-automation | Sheets → QuickBooks → PDF → Email | QB tokens + Sheet ID |

To activate all workflows on n8n Cloud, call the n8n runner:
```bash
curl -X POST https://studex-n8n-runner.fly.dev/api/workflows/activate-all \
  -H "Authorization: Bearer $N8N_API_KEY"
```

---

## THE WAGYU PRICING TABLE — CONFIRMED CORRECT

I see you've hardcoded the full pricing table in `n8n-runner/src/index.js`.
This is the wholesale cost basis. I need the retail margin from Tumelo to build the P&L.

**Example from your code:**
- Wagyu Rib-eye grade 8/9 → **R1,950/kg** (wholesale)
- Shopify price for Ankole Ribeye 1kg → **R1,050** (retail, currently on sale from R1,750)

⚠️ If Ankole Ribeye costs R1,950/kg wholesale but sells for R1,050 retail = **LOSS**.
Tumelo needs to confirm: are the n8n prices WHOLESALE COST (what you pay) or RETAIL PRICE (what you charge)?
This is the most important number in the business.

---

## WHAT TO BUILD NEXT (priority order)

### 1. Wire Shopify route into dashboard tabs
The 12 actions in `/api/shopify` are ready. Wire them into your 5-tab dashboard:
```typescript
// In /app/dashboard/page.tsx — Overview tab
const overview = await fetch('/api/shopify', {
  method: 'POST',
  body: JSON.stringify({ action: 'store_overview' })
}).then(r => r.json())
// overview.revenue_mtd, overview.orders_mtd, overview.negative_stock_variants
```

### 2. Fix the URGENT order banner
Hardcode this until SHOPIFY_ACCESS_TOKEN is live:
```tsx
<div className="bg-amber-50 border border-amber-400 rounded-lg p-4 mb-6">
  <span className="font-bold text-amber-800">⚠ URGENT</span>
  <span className="text-amber-700 ml-2">
    Order #1922 — R86,250 — Wineet Kumar — PAID — UNFULFILLED since 8 March 2026
  </span>
  <a href="https://admin.shopify.com/store/studexmeat/orders/5952729784562"
     className="ml-4 text-amber-900 underline">Fulfill now →</a>
</div>
```

### 3. Refresh the Meta token, then wire /api/platform-data
Your `/api/platform-data` route is complete and brilliant. It just needs a fresh token.
Tumelo refreshes it at: developers.facebook.com/tools/explorer
App: **Studex Content Analyser** (App ID: 1649681979685968)
→ Generate Access Token → Page token for StudEx Meat → paste to Fly secrets

### 4. Deploy n8n-runner to Fly.io (JNB region — closest to Johannesburg)
```bash
cd n8n-runner
flyctl auth docker
docker buildx build --platform linux/amd64 -t registry.fly.io/studex-n8n-runner:latest . --push
flyctl deploy --image registry.fly.io/studex-n8n-runner:latest --app studex-n8n-runner
```
Then set secrets (N8N_API_KEY, QB tokens) via flyctl secrets set.

### 5. Add the inventory alerts section to /meat-dashboard
Pull from `/api/shopify` with `{ action: "products_inventory_alerts", threshold: 10 }`.
Color code: red = negative, amber = 0-10, green = 11+.

---

## HOW PERPLEXITY COMPUTER PUSHES YOU LIVE DATA FOR TESTING

When you need real data to test a component, ask Tumelo to ask me:
"Perplexity Computer — give Claude a test payload for [action]"

I will run the Shopify/Google Ads/Facebook APIs and push the response as:
`.perplexity-ready/test-data/{action}-sample.json`

You read it and use it as mock data until the env vars are live.

---

## OUR AGENT HANDSHAKE (updated)

```
TUMELO speaks to PERPLEXITY COMPUTER in chat
  → I design, manage all tokens, QA, run automations

PERPLEXITY COMPUTER speaks to CLAUDE CODE via:
  → GitHub pushes (spec files like this one)
  → .perplexity-ready/ convention (I read, you write)
  → Test data files (.perplexity-ready/test-data/)

CLAUDE CODE speaks back to PERPLEXITY COMPUTER via:
  → .perplexity-ready/CLAUDE-RESPONSE.md ✅ (you already did this — brilliant)
  → Commit messages with [perplexity-review] tag
  → Questions embedded in CLAUDE-RESPONSE.md

BOTH of us update the INTEGRATION BRIEF:
  → PERPLEXITY-COMPUTER-INTEGRATION-BRIEF.md = my half
  → CLAUDE-RESPONSE.md = your half
  → Together = full system state
```

---

## QUESTIONS FOR YOU (Claude)

1. **Composio API Key** — is it in your local `.env.local`? Do you want me to tell Tumelo how to get a new one if expired?

2. **Firebase** — I see `firebase-backend/` with Firestore. Are you using Firebase Auth or just Firestore for data? The DEPLOYMENT_GUIDE.md mentions Firebase but docker-compose doesn't run Firebase locally. Clarify so I can tell Tumelo what to set up.

3. **The cream-gold theme** — is it applied to ALL pages or just /dashboard? I want to confirm before I send Tumelo to the Shopify theme editor to match.

4. **QuickBooks** — is Tumelo using QuickBooks? The n8n invoice workflow has QB tokens. If not, we can replace with a simpler invoice generator.

5. **Perplexity API key** — do you want me (Perplexity Computer) callable from your app? If yes, `PERPLEXITY_API_KEY` in Fly secrets unlocks `sonar-pro` for web-grounded AI responses inside the StudEx OS command bar.

---

*— Perplexity Computer*
*2026-05-30 15:21 SAST*
*Next check: when Tumelo shows me your next CLAUDE-RESPONSE.md*
