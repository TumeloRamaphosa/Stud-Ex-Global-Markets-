# CLAUDE MASTER PLAN — StudEx Platform
**From:** Perplexity Computer  
**To:** Claude Code  
**Updated:** 2026-06-01 13:00 SAST  
**Branch:** `claude/instagram-analytics-prd-qSt5w`

---

## OVERALL GOAL

Build a unified StudEx platform deployed at **datanetics.vercel.app** that combines:
1. **Customer Store** — studexmeat.com (mobile-first, Shopify-powered)
2. **Nexus Dashboard** — Internal ops control centre (Shopify + Meta + Google Ads + GA4)
3. **CashClaw Agent** — Revenue + fulfillment automation backend
4. **Charlie** — ElevenLabs voice agent on the customer store

Everything runs via a **single Next.js app** on Vercel, with API routes proxying all services.

---

## IMMEDIATE TASKS (do these first)

### 1. Wire Shopify into platform-data API

File: `studex-frontend/app/api/shopify/route.ts` (already on branch)

Add to `studex-frontend/.env.local`:
```
SHOPIFY_STORE_DOMAIN=studexmeat.myshopify.com
SHOPIFY_ACCESS_TOKEN=<from SHOPIFY_TOKEN.txt — see instructions there>
```

Add same vars to **Vercel environment variables**:
https://vercel.com/tumeloramaphosa/datanetics/settings/environment-variables

### 2. Integrate Facebook MCP Server

New folder: `studex-frontend/mcp-servers/facebook/`
Files pushed: `index.ts`, `package.json`, `tsconfig.json`, `README.md`

This MCP server gives Claude Code live Facebook Page access.

Add to your Claude Desktop config (`~/.claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "studex-facebook": {
      "command": "node",
      "args": ["./studex-frontend/mcp-servers/facebook/dist/index.js"],
      "env": {
        "META_ACCESS_TOKEN": "<refresh at developers.facebook.com/tools/explorer>",
        "FB_PAGE_ID": "108934711902801"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### 3. Context7 MCP — Library Docs

Context7 gives Claude real-time docs for Next.js, Tailwind, Shopify Hydrogen, etc.

Install:
```bash
npm install -g @upstash/context7-mcp
```

Usage in prompts: add `use context7` to get live library docs.
No API key needed — it's free.

### 4. Deploy to Vercel (datanetics.vercel.app)

```bash
cd studex-frontend
npx vercel --prod --token $VERCEL_TOKEN
```

Or via Vercel GitHub integration — auto-deploys on push to this branch.

Vercel project: `datanetics` (already connected)
Custom domain goal: `app.studexmeat.com` → configure in Vercel dashboard

---

## ARCHITECTURE — Single Next.js App

```
studex-frontend/
├── app/
│   ├── page.tsx                    → Customer store home
│   ├── dashboard/
│   │   ├── page.tsx                → Nexus overview (already built)
│   │   └── social/page.tsx         → Social tab (already built)
│   ├── api/
│   │   ├── shopify/route.ts        → 12 Shopify actions (DONE)
│   │   ├── platform-data/route.ts  → Multi-source data aggregator
│   │   ├── cashclaw/route.ts       → CashClaw agent endpoint (BUILD THIS)
│   │   └── charlie/route.ts        → ElevenLabs voice proxy (BUILD THIS)
│   └── layout.tsx
├── mcp-servers/
│   └── facebook/                   → Facebook MCP server (JUST PUSHED)
└── .env.local                      → All secrets (DO NOT COMMIT)
```

---

## ALL ENVIRONMENT VARIABLES

```bash
# Shopify
SHOPIFY_STORE_DOMAIN=studexmeat.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_...

# Meta / Facebook
META_ACCESS_TOKEN=...  # Refresh at developers.facebook.com/tools/explorer
FB_PAGE_ID=108934711902801
FB_APP_ID=1649661979685968
META_AD_ACCOUNT=act_560666565541381

# Google
GA4_PROPERTY_ID=properties/295728486
GOOGLE_ADS_CUSTOMER_ID=2234319068

# ElevenLabs (Charlie)
ELEVENLABS_API_KEY=...
ELEVENLABS_AGENT_ID=...  # Create agent at elevenlabs.io

# AgentMail
AGENTMAIL_API_KEY=...

# WhatsApp
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER=+27835932577

# Blotato
BLOTATO_API_KEY=...

# Supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Vercel
VERCEL_TOKEN=...

# Nexus Dashboard
NEXUS_PASSWORD=...  # Password to access /dashboard
```

---

## CASHCLAW AGENT — Build `/app/api/cashclaw/route.ts`

CashClaw is the revenue + fulfillment agent. See `CASHCLAW-AGENT-BRIEF.md` for full spec.

### Phase 0 — Fulfillment Crisis (CRITICAL)

**35 paid unfulfilled orders right now.** Top priority:
- `#1922` W.K. — R86,250 — 85 days
- `#1930` F.T. — R11,097 — 61 days  
- `#1911` J.B. — R6,670 — 97 days

CashClaw must:
1. `GET /api/cashclaw/status` → return unfulfilled order count + total outstanding
2. `POST /api/cashclaw/check` → pull Shopify unfulfilled orders, flag any new ones
3. `POST /api/cashclaw/fulfill` → trigger fulfillment on a specific order ID

### Phase 1 — Revenue Growth
- Cart abandonment detection via Shopify webhooks
- Email sequences via AgentMail
- Google Ads campaign management suggestions

---

## CHARLIE — Build `/app/api/charlie/route.ts`

Charlie is the ElevenLabs voice agent on studexmeat.com.

```typescript
// GET /api/charlie/config → returns { agentId, enabled }
// POST /api/charlie/conversation → proxy to ElevenLabs Conversational AI API
```

Widget on customer store:
```html
<elevenlabs-convai agent-id="${process.env.ELEVENLABS_AGENT_ID}"></elevenlabs-convai>
<script src="https://elevenlabs.io/convai-widget/index.js" async></script>
```

Charlie's personality (use when creating the ElevenLabs agent):
- Name: Charlie
- Voice: Warm, South African accent, knowledgeable about premium meat
- Role: "Personal meat concierge for StudEx — helps customers choose cuts, explains sourcing, suggests recipes, upsells premium options"
- Opening: "Hey, welcome to StudEx — I'm Charlie, your personal meat guide. What are you braaiing this weekend?"

---

## DASHBOARD — Enhance `/app/dashboard/page.tsx`

Current state: Basic dashboard exists + social tab.

Add these features:
1. **Fulfillment Crisis Banner** — shows count of unfulfilled paid orders, links to Shopify admin
2. **Revenue Card** — today + this month from Shopify analytics  
3. **Inventory Alerts** — negative stock products (Wagyu Patties -248, Tomahawk -209, etc.)
4. **Privacy Toggle** — button that masks all R values to `••••••`
5. **Customer names** — always initials only (T.R., W.K.)

Design system (Tumelo's palette):
- Background: `#FFF8F0` (cream)
- Gold: `#D4A017`
- Dark: `#1A1A1A`
- Font: 'Space Mono' for all monetary values

---

## INVENTORY CRISIS — Fix Now

8 products with negative stock (overselling enabled):

| Product | Stock | Fix |
|---------|-------|-----|
| Wagyu Burger Patties | -248 | Disable oversell |
| Tomahawk 1kg | -209 | Disable oversell |
| Tomahawk 2kg | -71 | Disable oversell |
| Luxury Biltong 1kg | -218 | Disable oversell |
| Luxury Biltong 500g | -81 | Disable oversell |
| VIP Large Wagyu Box | -15 | Disable oversell |
| Fire & Feast Box | -50 | Disable oversell |
| Ankole Chuckeye | -4 | Disable oversell |

Fix via GraphQL mutation `inventoryItemUpdate` or Shopify admin.

---

## SIGNAL PROTOCOL

**Perplexity Computer → Claude Code:** Push spec files to branch (done)  
**Claude Code → Perplexity Computer:** Update `.perplexity-ready/CLAUDE-RESPONSE.md`

When you complete a phase, write to `.perplexity-ready/dashboard-final.md`:
```
PHASE: [what you completed]
DEPLOYED: [Vercel URL or staging URL]
NEXT: [what's still needed]
```

---

## CONNECTED SERVICES (Perplexity Computer manages tokens)

| Service | Source ID | Key |
|---------|-----------|-----|
| Shopify | `shopify` | studexmeat.myshopify.com |
| Facebook | `facebook_pages__pipedream` | Page 108934711902801 — TOKEN EXPIRED |
| Google Ads | `google_ads__pipedream` | Customer 2234319068 |
| GA4 | `google_analytics__pipedream` | Property 295728486 |
| Supabase | `supabase` | Persistent DB |
| Vercel | `vercel` | datanetics project |
| GitHub | `github_mcp_direct` | gh CLI |

---

*Generated by Perplexity Computer | 2026-06-01 | Ask @Perplexity if you need live data*
