# DASHBOARD-FINAL-SPEC.md
## studex-frontend — Complete Dashboard with Real Data
## From: Perplexity Computer | Date: 2026-05-31

> Replace ALL mock/placeholder data in `/app/dashboard/page.tsx` with these real API calls.
> This spec includes exact response shapes from live API calls made today.

---

## LIVE DATA CONFIRMED (pulled 2026-05-31)

### Shopify — Real Data Shape from list-orders

```json
{
  "orders": [
    {
      "id": "gid://shopify/Order/6539837374706",
      "name": "#1941",
      "createdAt": "2026-05-27T19:01:12Z",
      "customerName": "Henk Marais",
      "totalPrice": "552.5",
      "currencyCode": "ZAR",
      "financialStatus": "PAID",
      "fulfillmentStatus": "UNFULFILLED",
      "lineItemCount": 1
    }
  ]
}
```

### Google Ads — Customer ID confirmed
`customers/2234319068` — zero campaigns live.
Use this format in all Google Ads tool calls: `"customer_id": "2234319068"`

### Instagram — Real data shape from /api/platform-data (GET)
```json
{
  "instagram": {
    "profile": { "followers_count": N, "follows_count": N, "media_count": N },
    "stats": { "followers": N, "engRate": "2.45", "totalLikes": N, "reelCount": N },
    "topPosts": [{ "caption": "...", "likes": N, "comments": N, "type": "IMAGE", "permalink": "..." }],
    "insights": { "reach": N, "follower_count": N, "profile_views": N }
  }
}
```

### Facebook — Page ID 108934711902801
Token expired. Use Composio account ID: `3193a5d4-d47e-447b-9059-b1444e971b2c`
or wait for Tumelo to refresh token at Graph API Explorer.

---

## DASHBOARD PAGE ARCHITECTURE

5 tabs, all replacing mock data:

```
/app/dashboard/page.tsx
  Tab 1: Overview      ← Shopify MTD + platform status + unfulfilled alert
  Tab 2: Shopify       ← Orders, revenue chart, inventory, top products
  Tab 3: Social        ← Facebook + Instagram (Composio) + post scheduler
  Tab 4: Ads           ← Google Ads (zero campaigns state) + Meta Ads
  Tab 5: LinkedIn      ← Coming soon state (connector not yet added)
```

---

## TAB 1 — OVERVIEW

### Top KPI Cards (4 across)

```typescript
// Card 1: Revenue MTD
const shopify = await fetch('/api/shopify', {
  method: 'POST',
  body: JSON.stringify({ action: 'store_overview' })
}).then(r => r.json())

// Render:
// Revenue MTD: R{shopify.revenue_mtd.toLocaleString('en-ZA', {style:'currency', currency:'ZAR'})}
// Orders MTD: {shopify.orders_mtd}
// Unfulfilled (PAID): {shopify.unfulfilled_paid}  ← RED if > 0
// Inventory Alerts: {shopify.negative_stock_variants} critical  ← AMBER if > 0
```

### URGENT BANNER — show if unfulfilled_paid > 0
```tsx
{shopify.unfulfilled_paid > 0 && (
  <div className="bg-red-950 border border-red-500 rounded-xl p-4 mb-6 flex items-center gap-3">
    <span className="text-red-400 text-xl">⚠</span>
    <div>
      <p className="text-red-300 font-semibold">
        {shopify.unfulfilled_paid} paid orders awaiting fulfillment
      </p>
      <p className="text-red-400 text-sm">
        Oldest: {shopify.unfulfilled_orders[0]?.order_number} — {shopify.unfulfilled_orders[0]?.customer} — R{shopify.unfulfilled_orders[0]?.total?.toLocaleString()} — waiting {shopify.unfulfilled_orders[0]?.days_waiting} days
      </p>
    </div>
    <a href="https://admin.shopify.com/store/studexmeat/orders?fulfillment_status=unfulfilled&financial_status=paid"
       target="_blank"
       className="ml-auto text-red-300 underline text-sm">
      Fulfill all →
    </a>
  </div>
)}
```

### Platform Status Row
```tsx
const platforms = [
  { name: 'Shopify', status: 'live', detail: `${shopify.orders_mtd} orders MTD` },
  { name: 'Facebook', status: fbTokenExpired ? 'warning' : 'live', detail: fbTokenExpired ? 'Token expired' : '2,551 fans' },
  { name: 'Instagram', status: igLinked ? 'live' : 'warning', detail: igLinked ? `${ig.followers} followers` : 'Not linked to FB Page' },
  { name: 'Google Ads', status: 'warning', detail: 'No campaigns live' },
  { name: 'LinkedIn', status: 'disconnected', detail: 'Not connected' },
]
// Green dot = live, amber = warning, red = disconnected
```

### Recent Orders Table (last 10, real data)
```typescript
const { orders } = await fetch('/api/shopify', {
  method: 'POST', body: JSON.stringify({ action: 'orders_recent', limit: 10 })
}).then(r => r.json())

// Columns: Order # | Customer (initials) | Amount | Status | Fulfillment | Date
// Row color: RED row if financialStatus=PAID and fulfillmentStatus=UNFULFILLED
```

---

## TAB 2 — SHOPIFY

### Revenue Sparkline (30 days)
```typescript
const { daily_revenue } = await fetch('/api/shopify', {
  method: 'POST', body: JSON.stringify({ action: 'orders_daily_revenue' })
}).then(r => r.json())
// daily_revenue: [{ date: "2026-05-01", revenue: 4550 }, ...]
// Use Recharts AreaChart, gold (#C9A84C) fill, dark background
```

### Top Products by Revenue
```typescript
const { top_products } = await fetch('/api/shopify', {
  method: 'POST', body: JSON.stringify({ action: 'products_top_revenue', limit: 8 })
}).then(r => r.json())
// top_products: [{ product_id, title, revenue, units }]
// Use Recharts HorizontalBarChart
```

### Inventory Alerts Section
```typescript
const { alerts } = await fetch('/api/shopify', {
  method: 'POST', body: JSON.stringify({ action: 'products_inventory_alerts', threshold: 10 })
}).then(r => r.json())
// alerts: [{ product_title, variant_title, quantity, level: "critical"|"warning" }]
// critical = red badge + quantity in red
// warning  = amber badge

// KNOWN CRITICAL (from today's data):
// Wagyu Burger Patties: -248 | Tomahawk: -209 | Biltong: -218 | Fire+Feast: -50 | Beef Ribs: -54
```

### Unfulfilled Orders Full Table
```typescript
const { unfulfilled } = await fetch('/api/shopify', {
  method: 'POST', body: JSON.stringify({ action: 'orders_unfulfilled' })
}).then(r => r.json())
// Sort by created_at ASC (oldest first — most urgent)
// Show "Call" button per row (opens tel: link for Charlie)
// Show "Fulfill" button (opens Shopify admin deep link)
// admin deep link: https://admin.shopify.com/store/studexmeat/orders/{numeric_id}
```

---

## TAB 3 — SOCIAL (Facebook + Instagram)

### Data Source
All social data comes from `GET /api/platform-data` (Claude's Composio route).
This already fetches Instagram via Composio and Meta Ads via Graph API.

```typescript
const social = await fetch('/api/platform-data').then(r => r.json())

const ig = social.instagram
const fb_token_expired = !social.facebook || social.facebook?.error
```

### Facebook Section
```tsx
// If token expired:
<div className="border border-amber-500 rounded-xl p-4">
  <p className="text-amber-400 font-medium">⚠ Facebook token expired</p>
  <p className="text-amber-300 text-sm mt-1">
    Refresh at developers.facebook.com/tools/explorer
    → App: Studex Content Analyser (1649681979685968)
    → Generate Page Token for StudEx Meat
  </p>
  <a href="https://developers.facebook.com/tools/explorer"
     target="_blank"
     className="mt-3 inline-block text-gold underline text-sm">
    Refresh token →
  </a>
</div>

// If token valid: show fan_count, recent posts with engagement
```

### Instagram Section (Composio — live data)
```tsx
// Profile stats row:
// Followers: {ig.stats.followers}
// Following: {ig.stats.following}
// Posts: {ig.stats.totalPosts}
// Engagement rate: {ig.stats.engRate}%

// Insights (from ig.insights):
// Reach | Profile views | Interactions

// Top posts grid (5 posts):
{ig.topPosts.map(post => (
  <div key={post.permalink}>
    <p className="text-xs text-gray-400 truncate">{post.caption}</p>
    <p className="text-gold text-sm">{post.likes} likes · {post.comments} comments</p>
    <a href={post.permalink} target="_blank" className="text-xs text-gray-500">View →</a>
  </div>
))}
```

### Post Scheduler (Naledi)
```tsx
// Simple form to schedule a post via Perplexity Computer
// POST /api/facebook with:
// { action: "create_post", message: "...", scheduled_publish_time: unix_ts }
<textarea placeholder="Write a post for Naledi..." />
<input type="datetime-local" /> {/* Schedule time */}
<Button>Schedule on Facebook</Button>
<Button>Schedule on Instagram</Button>
```

---

## TAB 4 — ADS (Google + Meta)

### Google Ads
```typescript
// Customer ID: 2234319068
// All campaign calls: customer_id = "2234319068"

// Current state: ZERO campaigns
// Show empty state with CTA:
```

```tsx
// Empty state:
<div className="text-center py-12">
  <p className="text-gray-400 text-lg">No Google Ads campaigns running</p>
  <p className="text-gray-500 text-sm mt-2">
    Recommended: "wagyu beef south africa" — 390 searches/month — R3,000/month budget
  </p>
  <Button onClick={createFirstCampaign} className="mt-4 bg-gold text-black">
    Launch First Campaign
  </Button>
</div>

// createFirstCampaign() calls:
// POST /api/ads/google { action: "create_wagyu_search_campaign" }
// Which triggers Perplexity Computer to:
// 1. google_ads-create-or-update-campaign-budget
// 2. google_ads-create-or-update-campaign
// 3. google_ads-create-or-update-ad-group
// 4. google_ads-create-or-update-keywords
// 5. google_ads-create-responsive-search-ad
```

### Meta Ads (act_560666565541381)
```typescript
// From social = await fetch('/api/platform-data').then(r=>r.json())
const metaAds = social.metaAds  // already fetched in platform-data route
// metaAds.campaigns: [] (no campaigns)
// metaAds.insights: null (no spend data)

// Show same empty state as Google Ads
// Note: needs fresh META_ACCESS_TOKEN set on Fly.io
```

### Keyword Intelligence Panel (static — from Perplexity Computer research)
```tsx
const keywords = [
  { term: "wagyu beef south africa", volume: 390, competition: "HIGH", cpc: "R19–R120" },
  { term: "wagyu south africa", volume: 260, competition: "MEDIUM", cpc: "R15–R80" },
  { term: "premium meat delivery johannesburg", volume: 140, competition: "LOW", cpc: "R8–R40" },
  { term: "halaal wagyu", volume: 90, competition: "LOW", cpc: "R5–R25" },
  { term: "ankole beef south africa", volume: 50, competition: "VERY LOW", cpc: "R3–R15" },
]
```

---

## TAB 5 — LINKEDIN

```tsx
// Simple "coming soon" with connect CTA
<div className="text-center py-16">
  <div className="text-5xl mb-4">in</div>
  <p className="text-gray-300 font-medium">LinkedIn not yet connected</p>
  <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
    Connect LinkedIn to post B2B content, track company page analytics,
    and reach restaurant and hospitality buyers in South Africa.
  </p>
  <p className="text-gray-600 text-xs mt-4">
    Ask Perplexity Computer to add the LinkedIn connector
  </p>
</div>
```

---

## PRIVACY MODE (Global)

Already specced in CLAUDE.md. Wrap all monetary values:

```tsx
// PrivacyContext already in your app — use it
const { isPrivate } = usePrivacy()

function MaskedValue({ value, prefix = 'R' }: { value: number, prefix?: string }) {
  return isPrivate
    ? <span className="font-mono tracking-widest text-gray-500">{'•'.repeat(6)}</span>
    : <span className="font-mono">{prefix}{value.toLocaleString('en-ZA')}</span>
}
```

---

## DESIGN TOKENS (confirmed from your dashboard/page.tsx)

Your theme uses a cream-gold palette, not the dark theme from CLAUDE.md.
Keep YOUR palette — it's better for the StudEx brand:

```css
Background:  #FFF8F0  (warm cream)
Gold:        #D4A017  (your gold — keep this)
Card:        #FFFFFF with shadow-sm
Text:        #1A1A1A  primary, #666 muted
Danger red:  #DC2626
Warning:     #D97706
```

---

## BUILD ORDER

1. Replace mock `revenueData` array with real `/api/shopify { action: "orders_daily_revenue" }` call
2. Add the URGENT BANNER component using `orders_unfulfilled`
3. Replace mock `upcomingDeals` with real Shopify unfulfilled orders table
4. Wire Platform Status row using live checks
5. Wire Tab 3 Social using existing `GET /api/platform-data` (already built)
6. Wire Tab 4 Ads empty states with real Google Ads `list-campaigns` check
7. Add LinkedIn Tab 5 coming-soon panel
8. Add Privacy Mode toggle to header

---

## ENV VARS NEEDED (in .env.local and Fly.io secrets)

```
SHOPIFY_STORE_DOMAIN=studexmeat.myshopify.com
SHOPIFY_ACCESS_TOKEN=<get from Shopify admin>
META_ACCESS_TOKEN=<refresh at Graph API Explorer>
META_AD_ACCOUNT_ID=act_560666565541381
FACEBOOK_PAGE_ID=108934711902801
COMPOSIO_API_KEY=<already in your local .env>
GOOGLE_ADS_CUSTOMER_ID=2234319068
ANTHROPIC_API_KEY=<for AI features>
NEXT_PUBLIC_DASHBOARD_NAME=StudEx Command Center
```

---

## Signal When Done

Create: `.perplexity-ready/dashboard-final.md`
Content:
```
# Ready
Page: dashboard (all 5 tabs)
Date: {date}
Notes: Real data wired. Mock data removed. Social via Composio. Ads empty state.
```

---

*Perplexity Computer | 2026-05-31*
*Live data pulled this session — all order data and API shapes confirmed.*
