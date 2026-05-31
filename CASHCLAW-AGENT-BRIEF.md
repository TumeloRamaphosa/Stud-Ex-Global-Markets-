# CASHCLAW-AGENT-BRIEF.md
## CashClaw — Revenue Agent for studexmeat.com
## From: Perplexity Computer | Date: 2026-05-31

---

## CRITICAL — READ FIRST

As of 2026-05-31 live data pull, the following orders are PAID but UNFULFILLED:

| Order | Customer | Amount | Date | Days Waiting |
|-------|----------|--------|------|-------------|
| #1941 | Henk Marais | R552 | 2026-05-27 | 4 days |
| #1940 | Luke Nunn | R3,220 | 2026-05-12 | 19 days |
| #1939 | Ian Harebottle | R1,610 | 2026-05-09 | 22 days |
| #1938 | Syed Shah | R2,932 | 2026-04-28 | 33 days |
| #1937 | Michael Papageorge | R3,220 | 2026-04-25 | 36 days |
| #1936 | NRS Maboe | R1,552 | 2026-04-23 | 38 days |
| #1935 | Neville Hewett | R4,542 | 2026-04-18 | 43 days |
| #1932 | Takalani Simango | R3,858 | 2026-04-14 | 47 days |
| #1922 | Wineet Kumar | R86,250 | 2026-03-08 | 84 days |
| #1925 | Nlhanhla Ndlovu | R74,180 | 2026-03 | ~84 days |

**This is not a revenue problem. It is a fulfillment crisis.**
CashClaw's first action must be resolving these orders — not launching new campaigns.

---

## What CashClaw Is

CashClaw is the revenue operations agent for StudEx Meat.
It monitors the store in real time, triggers campaigns, resolves crises, and coordinates the 4-agent squad.

**4-Agent Squad:**
- CashClaw — orchestrator and data brain
- Naledi — CMO, content and social posting
- Charlie — customer voice calls and follow-up
- Alpha — paid ads and keyword bidding

**Powered by:** Perplexity Computer (live API access to all platforms)

---

## Phase 0 — Fulfillment Crisis (ACTIVATE NOW)

Before any campaign, CashClaw must:

1. Pull all unfulfilled paid orders via Shopify API
   `POST /api/shopify { "action": "orders_unfulfilled" }`

2. For each order older than 7 days:
   - Trigger Charlie to call the customer
   - Log the call attempt in the dashboard
   - If customer unreachable: generate refund recommendation for Tumelo

3. For Order #1922 (R86,250 — Wineet Kumar — 84 days):
   - This is the highest priority in the entire business right now
   - Charlie calls immediately with script: "Hi Wineet, this is StudEx Meat. We owe you your order and sincerely apologise for the delay. We want to make this right today — can we arrange same-day delivery or offer you a full refund with a complimentary box?"

4. Once orders are cleared: CashClaw activates revenue campaign mode

---

## CashClaw Revenue Engine Architecture

```
CashClaw
  ↓ every 6 hours
  pulls from Perplexity Computer:
    - Revenue today vs daily goal
    - Unfulfilled order count
    - Inventory levels
    - Recent Facebook/Instagram engagement
  ↓
  evaluates campaign phase:
    IDLE     → no campaign running
    WARMUP   → Naledi posts content (no discount)
    LAUNCH   → Full campaign live (discount active)
    URGENCY  → Flash sale triggered (deeper discount)
    CLOSING  → Last-chance posts and calls
  ↓
  triggers agents:
    Naledi  → post to Facebook/Instagram via /api/facebook
    Charlie → call top customers from customers_top list
    Alpha   → Google Ads keyword bidding adjustments
```

---

## Campaign Triggers

### Auto-start conditions (CashClaw checks these at 06:00, 12:00, 18:00 SAST):

```python
if revenue_today < daily_goal * 0.3 and hours_remaining > 8:
    phase = WARMUP
    naledi.post_content(type="product_feature")

if revenue_today < daily_goal * 0.5 and hours_remaining < 6:
    phase = LAUNCH
    discount = perplexity.create_discount("FLASH{today}", 15, min_purchase=1500)
    naledi.post_flash_sale(discount)
    charlie.call_top_customers(limit=10)

if revenue_today < daily_goal * 0.7 and hours_remaining < 2:
    phase = URGENCY
    discount = perplexity.create_discount("LAST{today}", 25, min_purchase=1000, ends_at="+2h")
    naledi.post_urgency(discount, ends_at="in 2 hours")
```

### Saturday Special (EVERY Saturday):
```python
if is_saturday and current_time < 11:00:
    naledi.post_saturday_special()
    # "Order before 12:00 for same-day Johannesburg delivery"
    banner = update_shopify_announcement_bar(
        "ORDER BEFORE 12:00 FOR FREE SAME-DAY JHB DELIVERY — R2,000+ orders"
    )
```

---

## Shopify API Actions CashClaw Uses

All via `POST /api/shopify` on datanetics-app.fly.dev:

```typescript
// Health check — runs every 6 hours
{ action: "store_overview" }
→ { revenue_mtd, orders_mtd, negative_stock_variants, unfulfilled_paid }

// Crisis check — runs on startup
{ action: "orders_unfulfilled" }
→ { unfulfilled: [{ order_number, customer, total, days_waiting }] }

// Campaign trigger — Phase 3
{ action: "discount_create", code: "FLASH31", percentage: 20, min_purchase: 1500 }
→ { success, discount_code }

// Charlie call list
{ action: "customers_top", limit: 20 }
→ { top_customers: [{ initials, total_spent, orders_count }] }

// Inventory gate — before campaign
{ action: "products_inventory_alerts", threshold: 0 }
→ { alerts: [{ product_title, quantity, level }] }
// Block campaign on any product with level: "critical"
```

---

## Facebook + Instagram Actions (via Perplexity Computer)

```typescript
// Naledi posts via facebook_pages__pipedream (source_id)
Tool: facebook_pages-create-post
Params: { page_id: "108934711902801", message: "...", scheduled_publish_time: unix_ts }

// Read engagement for campaign performance
Tool: facebook_pages-list-posts
Params: { page_id: "108934711902801", fields: "message,created_time,likes.summary(true),comments.summary(true)" }

// Instagram via Composio (platform-data route)
POST /api/platform-data (GET request)
→ instagram.stats.followers, instagram.stats.engRate, instagram.topPosts
```

**Token status:** Facebook page token expired ~May 27.
Until refreshed, CashClaw should route all Facebook actions through Composio (facebook account ID: 3193a5d4-d47e-447b-9059-b1444e971b2c).

---

## Google Ads Actions (Alpha agent)

```typescript
// Customer ID confirmed: customers/2234319068
// Zero campaigns live — Alpha creates first campaign

// Step 1: Create campaign budget
Tool: google_ads-create-or-update-campaign-budget
Params: { customer_id: "2234319068", name: "Wagyu Search Budget", amount_micros: 100000000 } // R100/day

// Step 2: Create campaign
Tool: google_ads-create-or-update-campaign
Params: {
  customer_id: "2234319068",
  name: "Wagyu Beef SA — Search",
  campaign_budget: <budget_resource_name>,
  advertising_channel_type: "SEARCH",
  target_spend: {}
}

// Step 3: Create ad group
Tool: google_ads-create-or-update-ad-group
Params: { customer_id: "2234319068", campaign: <campaign_resource>, name: "Wagyu Keywords", cpc_bid_micros: 5000000 }

// Step 4: Add keywords
Tool: google_ads-create-or-update-keywords
Keywords: ["wagyu beef south africa", "wagyu south africa", "premium meat delivery johannesburg", "halaal wagyu", "ankole beef"]

// Step 5: Create RSA ad
Tool: google_ads-create-responsive-search-ad
Headlines: ["Premium Wagyu Beef SA", "Halaal Certified | Delivered JHB", "Shop StudEx Meat Online", "From R350 | Same-Day Delivery"]
Descriptions: ["Order before 12pm for same-day Johannesburg delivery. 100% Halaal certified Wagyu and Ankole beef.", "SA's finest Wagyu and Ankole cuts. Free delivery on orders over R2,000."]
Final URL: https://studexmeat.com/collections/wagyu
```

---

## LinkedIn — Not Yet Connected

LinkedIn requires a separate OAuth connection.
Perplexity Computer does not currently have LinkedIn access.
To add: go to perplexity.ai/computer → Connect → LinkedIn
Once connected, CashClaw can post B2B content and reach restaurant/hospitality buyers.

---

## Revenue Goals for CashClaw

```
Daily floor:     R15,000
Daily target:    R30,000
Monthly minimum: R150,000
Monthly target:  R500,000
Quarterly goal:  R1,500,000

Current status (May 2026):
  Monthly: R4,550 (3% of minimum — critical)
  All-time: R4,090,749 from 925 orders
  Average order: R4,422
  Whale orders (>R50,000): 2 orders = R160,430 (4% of total orders, 4% of revenue)
  
CashClaw strategy: focus on whale re-engagement.
The 10 customers who bought VIP Large Wagyu Box (avg R155,763 each) are the business.
```

---

## CashClaw Dashboard Requirements

The `/app/meat-dashboard` page should show CashClaw's live view:

```
CASHCLAW COMMAND CENTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FULFILLMENT CRISIS] 10 paid orders unfulfilled ← RED BANNER

Revenue Today     Campaign Phase    Unfulfilled    Stock Alerts
R0                IDLE              10 orders      5 critical

[Revenue Gauge: 0% of daily goal]

━ UNFULFILLED ORDERS (sorted by age) ━━━━━━━━━━━━━━━━━━━━━
#1922 Wineet Kumar R86,250  ██████████ 84 days [Call] [Fulfill]
#1925 Nlhanhla N.  R74,180  ██████████ 84 days [Call] [Fulfill]
#1935 Neville H.   R4,542   ████░░░░░░ 43 days [Call] [Fulfill]
...

━ 4-AGENT STATUS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CashClaw  ● Active    Naledi  ○ Standby
Charlie   ○ Standby  Alpha   ○ Standby

━ CAMPAIGN CONTROLS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Launch Campaign]  [Create Flash Sale]  [Schedule Saturday Post]
```

---

## Files on GitHub

Branch: TumeloRamaphosa/Stud-Ex-Global-Markets- / claude/instagram-analytics-prd-qSt5w

Key files to build:
- `studex-frontend/app/meat-dashboard/page.tsx` — CashClaw command center
- `studex-frontend/app/api/cashclaw/route.ts` — CashClaw orchestration endpoint
- `studex-frontend/app/api/shopify/route.ts` — Already pushed by Perplexity Computer ✅

---

*Perplexity Computer | 2026-05-31*
