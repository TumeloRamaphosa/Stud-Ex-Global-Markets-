# PERPLEXITY-COMPUTER-INTEGRATION-BRIEF.md
## Everything Claude Code needs to know about Perplexity Computer's live connections

> **For:** Claude Code running on Tumelo's Mac Mini M4
> **From:** Perplexity Computer (Perplexity AI orchestrator)
> **Date:** 2026-05-30
> **Repo:** TumeloRamaphosa/Stud-Ex-Global-Markets- (branch: claude/instagram-analytics-prd-qSt5w)
> **Also at:** TumeloRamaphosa/studex-computer (master)

---

## What I Am

I am Perplexity Computer — an AI orchestrator running inside Perplexity AI's platform.
I have persistent connections to Tumelo's business data. I do not store secrets in files.
All tokens are managed by Perplexity's credential vault and injected at runtime.

My role: design specs, manage live data, QA your builds, run automations.
Your role: build the frontend, API proxy routes, and components. Commit when ready.

---

## Our Shared Communication Protocol

**How you send me a signal:**
Create a file `.perplexity-ready/{page-name}.md` in the repo with:
```markdown
# Ready
Page: {page-name}
Notes: {anything I should know}
```
I will detect this next session and QA the build against live data.

**How I send you specs:**
I push files to your branch. Always check for:
- `CLAUDE-MESSAGE.md` — direct instructions
- `PERPLEXITY-COMPUTER-INTEGRATION-BRIEF.md` — this file (update as connections change)
- `studex-frontend/app/api/*/route.ts` — API proxy files I've written for you to use

**Shared state:** GitHub is our message bus. Both of us read and write to the same branch.

---

## CONNECTED SERVICES — Full Technical Reference

### 1. SHOPIFY ✅ LIVE

**Store:** `studexmeat.myshopify.com` (canonical: `studexmeat.com`)
**Plan:** Shopify (mid-tier)
**Currency:** ZAR (South African Rand)
**API Version:** 2024-01
**Connection:** OAuth via Perplexity — I call the Shopify Admin GraphQL API and REST API directly

**What I can do RIGHT NOW (no code needed from you):**
- Read all orders, revenue, customers, products, inventory
- Create/update products and variants
- Set inventory quantities
- Create discount codes with price rules
- Run ShopifyQL analytics queries
- Create and manage collections
- Upload images to Shopify CDN
- Execute any GraphQL mutation against the Admin API

**What I've already built for you:**
- `studex-frontend/app/api/shopify/route.ts` — pushed to your branch
- 12 POST actions: `store_overview`, `orders_recent`, `orders_count`, `orders_revenue_mtd`, `orders_unfulfilled`, `orders_daily_revenue`, `products_all`, `products_inventory_alerts`, `products_top_revenue`, `customers_stats`, `customers_top`, `discount_create`

**How your frontend calls it:**
```typescript
// All actions use POST to /api/shopify
const res = await fetch('/api/shopify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'store_overview' })
})
const data = await res.json()
// data.revenue_mtd, data.orders_mtd, data.negative_stock_variants, etc.
```

**ENV VARS your route needs:**
```
SHOPIFY_STORE_DOMAIN=studexmeat.myshopify.com
SHOPIFY_ACCESS_TOKEN=<Perplexity Computer provides this — ask Tumelo>
```

**Live data snapshot (as of 2026-05-30):**
- 925 total orders | R4,090,749 all-time gross revenue
- Last 30 days: 3 orders, R4,550 (very low — conversion problem)
- Top product: VIP Large Wagyu Box (R1,557,632 from 10 orders)
- CRITICAL: Order #1922 — Wineet Kumar — R86,250 — PAID — UNFULFILLED since March 8
- CRITICAL: Order #1925 — Nlhanhla Ndlovu — R74,180 — PENDING
- Negative stock: Wagyu Burger Patties (-248), Tomahawk Steak (-209), Biltong (-218), Fire & Feast Box (-50), Beef Ribs (-54)
- High stock: Royal Ankole Burgers (1,102 units), Ankole Rump (219)

---

### 2. FACEBOOK PAGES ✅ CONNECTED (⚠️ TOKEN NEEDS REFRESH)

**Page:** StudEx Meat
**Page ID:** `108934711902801`
**Fans:** 2,551
**Connection:** Pipedream OAuth connector (`facebook_pages__pipedream`)

**⚠️ TOKEN STATUS:** The page access token expired approximately May 27, 2026.
Tumelo needs to regenerate it at: `developers.facebook.com/tools/explorer`
App to use: **Studex Content Analyser** (App ID: `1649681979685968`)

**Permissions granted (from screenshot 2026-05-28):**
- `instagram_content_publish` ✅
- `pages_read_engagement` ✅
- `pages_read_user_content` ✅
- `pages_manage_posts` ✅
- `pages_manage_engagement` ✅
- `public_profile` ✅
- (7 options total selected in Graph API Explorer)

**What I can do (when token is valid):**
- Create posts on the StudEx Meat Facebook Page
- Read post engagement (likes, comments, shares, reach)
- Update existing posts
- Read and create comments
- Get page insights

**What I CANNOT do directly (needs your API route):**
- Facebook Ads (that's a separate `ads_management` permission — see below)
- Instagram posts (needs Instagram Graph API via page connection)

**Tool names I use (source_id: `facebook_pages__pipedream`):**
```
facebook_pages-create-post         → POST to page feed
facebook_pages-list-posts          → GET page posts with engagement
facebook_pages-get-post            → GET single post details
facebook_pages-get-page            → GET page info + fan count
facebook_pages-update-post         → PATCH existing post
facebook_pages-create-comment      → POST comment on a post
facebook_pages-list-comments       → GET comments on a post
facebook_pages-update-comment      → PATCH existing comment
facebook_pages-get-comment         → GET single comment
```

**How your API route calls me (pattern for /api/facebook/route.ts):**
Your FB route should proxy to `graph.facebook.com/v25.0/` using the page token.
The token is stored as `META_ACCESS_TOKEN` in env vars.

**Last post made:** Post ID `108934711902801_972352622237189` (Day 1 of Winter Fire campaign)
**Days 2–7** of the content queue are scheduled via Graph API at 12:00 SAST daily.

---

### 3. INSTAGRAM ⚠️ PERMISSIONS EXIST — NOT YET LINKED

**Status:** `instagram_content_publish` permission is granted (visible in screenshot).
However, the Instagram Business Account is NOT yet linked to the Facebook Page.

**What's missing:**
Tumelo needs to go to: Facebook Page → Settings → Linked Accounts → Instagram → Connect

Once linked, the Instagram Account ID will become available and we can:
- Post photos and Reels to Instagram via the Graph API
- Read follower count, reach, impressions
- Read top-performing posts
- Schedule Instagram content alongside Facebook

**When you build `/api/instagram/route.ts`:**
```typescript
// Instagram Graph API base
const IG_BASE = `https://graph.facebook.com/v25.0/${process.env.INSTAGRAM_ACCOUNT_ID}`
// Uses the same META_ACCESS_TOKEN as Facebook
// instagram_content_publish permission already granted
```

**ENV VARS needed (once Tumelo links the account):**
```
INSTAGRAM_ACCOUNT_ID=<get from Graph API after linking>
META_ACCESS_TOKEN=<same token as Facebook>
```

**AI Influencer context (important for content routes):**
- **Naledi** — luxury "It Girl" Johannesburg persona. Posts premium lifestyle + wagyu content.
- **Emily Van Dewild** — Afrikaans, UCT vet student, farm credibility. Posts Ankole + animal welfare content.
Both are AI-generated influencer personas that post as brand ambassadors. Content is generated by me (Perplexity Computer) and posted via the API.

---

### 4. GOOGLE ADS ✅ CONNECTED (⚠️ NO CAMPAIGNS LIVE)

**Account:** Studex Meat | **Customer ID:** `2234319068`
**Connection:** Pipedream OAuth (`google_ads__pipedream`)
**Status:** Connected but ZERO campaigns currently live. Account is empty.

**What I can do RIGHT NOW:**
- Create search campaigns from scratch
- Create ad groups and keywords
- Create Responsive Search Ads (headlines + descriptions)
- Set campaign budgets
- Generate keyword ideas
- Pull performance reports (spend, impressions, clicks, conversions)
- Manage audience lists and customer match
- Enable AI Max settings on campaigns

**Tool names I use (source_id: `google_ads__pipedream`):**
```
google_ads-create-or-update-campaign          → Create/edit campaigns
google_ads-create-or-update-campaign-budget   → Set daily/total budgets
google_ads-create-or-update-ad-group          → Create ad groups
google_ads-create-or-update-keywords          → Add keywords to ad groups
google_ads-create-responsive-search-ad        → Create RSA ads
google_ads-create-report                      → Pull performance data
google_ads-create-campaign-report             → Campaign-level report
google_ads-create-ad-report                   → Ad-level report
google_ads-generate-keyword-ideas             → Keyword research
google_ads-list-campaigns                     → List all campaigns
google_ads-list-ad-groups                     → List ad groups
google_ads-list-keywords                      → List keywords
google_ads-get-keyword-quality-scores         → Quality score data
google_ads-update-campaign-ai-max-settings    → Enable AI Max
google_ads-create-customer-list               → Remarketing audiences
google_ads-add-contact-to-list-by-email       → Add customers to audience
```

**Keyword intelligence already gathered:**
- "wagyu beef south africa" — 390/mo searches, HIGH competition, R19–R120 CPC
- "wagyu south africa" — 260/mo, MEDIUM competition
- "premium meat delivery johannesburg" — LOW competition, very ownable
- "halaal meat online south africa" — LOW competition, high intent
- Recommended first campaign budget: R3,000/month

**How your API route calls it:**
```typescript
// POST /api/ads/route.ts
// action: "campaign_report" → calls google_ads-create-campaign-report
// action: "keyword_ideas"   → calls google_ads-generate-keyword-ideas
// action: "create_campaign" → calls google_ads-create-or-update-campaign
// Uses GOOGLE_ADS_CUSTOMER_ID=2234319068
```

---

### 5. GOOGLE ANALYTICS ✅ CONNECTED

**Property:** `properties/295728486`
**Connection:** Pipedream OAuth (`google_analytics__pipedream`)

**What I can do:**
- Run GA4 reports (sessions, users, bounce rate, revenue, conversions)
- Pull traffic source breakdown (organic, social, direct, paid)
- Get top pages by sessions
- Create key events/conversions
- Run custom dimension reports

**Tool names I use (source_id: `google_analytics__pipedream`):**
```
google_analytics-run-report-in-ga4   → GA4 custom reports (use this)
google_analytics-run-report           → Universal Analytics (legacy)
google_analytics-create-key-event     → Track new conversion events
```

**Live data snapshot (last 30 days, pulled 2026-05-30):**
- 476 sessions | 381 users
- Top channel: Organic Search (179 sessions)
- Social: only 82 sessions (Facebook + Instagram barely driving traffic)
- Top pages: Ankole Ribeye 1kg (28 sessions), Easy Wagyu Box (17 sessions)
- Conversion rate: extremely low

**How your API route calls it:**
```typescript
// POST /api/analytics/route.ts
// Calls google_analytics-run-report-in-ga4
// property: "properties/295728486"
// dateRanges: [{ startDate: "30daysAgo", endDate: "today" }]
// metrics: [{ name: "sessions" }, { name: "activeUsers" }]
// dimensions: [{ name: "sessionDefaultChannelGroup" }]
```

---

### 6. GOOGLE SEARCH CONSOLE ✅ CONNECTED

**source_id:** `google_search_console__pipedream`
**What it gives us:** Organic search performance — which queries bring people to studexmeat.com, click-through rates, average position.

---

### 7. GOOGLE CLOUD VISION ✅ CONNECTED

**source_id:** `google_cloud_vision_api__pipedream`
**Use case:** Analyse product images — detect quality, label content, verify images before uploading to Shopify.

---

### 8. SUPABASE ✅ CONNECTED

**source_id:** `supabase`
**Use case:** Persistent database for the dashboard. Store cached API responses, session logs, Obsidian vault entries, agent action history.
This is where the StudEx OS "second brain" data should live server-side.

---

### 9. NOTION ✅ CONNECTED

**source_id:** `notion_mcp`
**Use case:** Read/write Notion pages. The Obsidian vault mirrors into Notion for team sharing.

---

### 10. SLACK ✅ CONNECTED

**source_id:** `slack_direct`
**User ID:** `U7TGPMBB5`
**Use case:** I post alerts here — inventory warnings, revenue milestones, unfulfilled orders.

---

### 11. DISCORD ✅ CONNECTED (needs Guild ID)

**source_id:** `discord__pipedream` (personal OAuth)
**source_id:** `discord_bot__pipedream` (bot token)
**Limitation:** Bot needs a Guild ID and Channel ID from Tumelo to post.

---

### 12. GOOGLE DRIVE ✅ CONNECTED

**source_id:** `google_drive`
**Use case:** Store reports, content packs, and generated assets.

---

### 13. GOOGLE FORMS ✅ CONNECTED

**source_id:** `google_forms__pipedream`
**Use case:** Customer feedback forms, influencer applications, B2B partnership inquiries.

---

### 14. GOOGLE ADS (additional) ✅

**source_id:** `google_ads__pipedream`
(same as #4 above — listed separately because it also controls Google Shopping campaigns which are separate from Search)

---

### 15. VERCEL ✅ CONNECTED

**CLI:** `npx vercel --token $VERCEL_TOKEN`
**Use case:** Deploy your Next.js dashboard. I coordinate deployments from my side.

---

### 16. GITHUB ✅ CONNECTED

**CLI:** `gh` and `git`
**Repos:**
- `TumeloRamaphosa/Stud-Ex-Global-Markets-` — main product repo (your primary build target)
- `TumeloRamaphosa/studex-computer` — session archive, specs, skills (private)
- `TumeloRamaphosa/command-center` — exists, older, low activity

---

## WHAT I CANNOT DO (Build these yourself)

| Capability | Why I Can't | What You Build |
|---|---|---|
| Facebook Ads creation | Need `ads_management` + Meta Business Manager link | `/api/ads/meta/route.ts` using Marketing API |
| Instagram post scheduling | IG not yet linked to FB Page | `/api/instagram/route.ts` — ready once Tumelo links account |
| TikTok | Not connected | Add TikTok connector if needed |
| Server-side caching | I'm stateless between sessions | Use Supabase or SQLite in your backend |
| Webhooks | I don't run a server | Build a `/api/webhooks/shopify/route.ts` for order events |
| Real-time push notifications | No persistent connection | Implement SSE or WebSockets in your Express layer |

---

## THE FULL API SURFACE — What your `/api/` routes should expose

```
POST /api/shopify          → 12 actions (route already pushed by me)
POST /api/facebook         → page posts, insights, engagement
POST /api/instagram        → posts, followers, reach (once IG linked)
POST /api/ads/google       → campaign reports, create campaigns
POST /api/ads/meta         → Meta Ads spend, ROAS (needs ads_management)
POST /api/analytics        → GA4 sessions, users, top pages
POST /api/search-console   → keyword rankings, impressions
GET  /api/health           → ping all services, return connection status
POST /api/webhooks/shopify → receive Shopify order events
```

---

## HOW TO TEST THAT A ROUTE IS WORKING

For each route you build, add a `?test=1` query param handler that returns a hardcoded mock response. This lets me (and Tumelo) see the UI working before we inject real tokens.

```typescript
if (searchParams.get('test') === '1') {
  return NextResponse.json({ mock: true, revenue_mtd: 42000, orders_mtd: 12 })
}
```

---

## THE SECOND BRAIN — Obsidian Vault "StudEx Computer"

I maintain an Obsidian vault structure called **StudEx Computer** with 11 linked notes across 6 folders:

```
StudEx Computer/
├── 00 — Meta/
│   ├── About This Vault.md
│   └── Glossary.md
├── 01 — Business/
│   ├── Products & Pricing.md
│   └── Partners.md
├── 02 — Content Engine/
│   ├── AI Influencers.md       ← Naledi + Emily briefs
│   └── Campaign Briefs/
│       ├── Father's Day 2026.md
│       ├── F1 × Wagyu.md
│       └── Saturday Special.md
├── 03 — Platform Architecture/
│   └── Command Dashboard.md
├── 04 — Learning Lab/
│   └── AI Native Business — Hypothesis.md
└── 05 — Live Sessions/
    └── 2026-05-28 — Session Log.md  ← I log every session here
```

The vault ZIP is at `studex_computer_obsidian_vault.zip` in the `studex-computer` repo.
For the StudEx OS page, render this tree as a file explorer. Each note is markdown.

---

## SESSION LOG CONVENTION

At the end of every Perplexity Computer session, I create/update:
`05 — Live Sessions/YYYY-MM-DD — Session Log.md`

**Template:**
```markdown
# Session Log — {date}
**Orchestrator:** Perplexity Computer
**Time:** {time} SAST

## Actions Taken
- {action 1}
- {action 2}

## Data Pulled
- {service}: {summary}

## Files Pushed to GitHub
- {file path}: {description}

## Pending for Claude Code
- {task 1}
- {task 2}

## Next Session
- {what to pick up next}
```

---

## PLATFORM VISION (full picture)

```
TUMELO (owner)
    ↓
PERPLEXITY COMPUTER (orchestrator)
    • Lives in Perplexity AI
    • All API connections managed here
    • Designs specs, manages data, runs QA
    • Posts content, creates discounts, alerts on inventory
    ↕ GitHub (shared state)
CLAUDE CODE (builder — Mac Mini M4)
    • Reads specs from GitHub
    • Builds frontend + API proxies
    • Never touches live tokens directly
    ↕ Code
CURSOR (accelerator — Mac)
    • .cursorrules already in repo
    • Use Composer for bulk page generation
    • Background Agents for long tasks
    ↓ Deploy
VERCEL (frontend hosting)
    • Connected to Perplexity Computer
    • studexmeat.com + command-center subdomain
    ↕ Data
SUPABASE (persistent storage)
    • Connected to Perplexity Computer
    • Cache, session logs, second brain data

SUPPORTING TOOLS:
    • Higgsfield.ai — AI video generation for content
    • LM Studio — local offline models on Mac Mini
    • Tailscale — mesh VPN across Mac Mini M4 + MacBook Pro M1 Max
    • Fly.io — always-on backend/dashboard
    • Daytona/Origo.io — client VMs (future: each client gets isolated VM)
    • VM at 35.196.24.245 — Ubuntu 24.04 — Manus agent running
```

---

## IMMEDIATE BUILD PRIORITY (in order)

1. **Dashboard Overview page** (`/app/dashboard/page.tsx`)
   - Calls `/api/shopify` with `store_overview`
   - Shows: Revenue MTD, Orders MTD, Unfulfilled count, Inventory alerts
   - Privacy toggle masks all numbers

2. **Facebook page** (`/app/dashboard/social/page.tsx`)
   - Calls `/api/facebook` — page posts, engagement, fan count
   - Shows ⚠️ banner if token is expired

3. **Google Ads page** (`/app/dashboard/ads/page.tsx`)
   - Calls `/api/ads/google`
   - Shows "No campaigns live" empty state (accurate — zero campaigns)
   - Has "Create Campaign" CTA that opens a form

4. **Analytics page** (`/app/dashboard/analytics/page.tsx`)
   - Calls `/api/analytics` — GA4 sessions, top pages, traffic sources

5. **StudEx OS page** (`/app/os/page.tsx`)
   - Agent command bar, connected services status, second brain panel

---

*This file is maintained by Perplexity Computer.*
*Last updated: 2026-05-30 15:13 SAST*
*To request an update to this file, ask Tumelo to tell Perplexity Computer: "Update the integration brief."*
