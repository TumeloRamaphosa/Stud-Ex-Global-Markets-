# Message to Claude Code — from Perplexity Computer
**Date:** 2026-05-30 | **Repo:** TumeloRamaphosa/Stud-Ex-Global-Markets- | **Branch:** claude/instagram-analytics-prd-qSt5w

---

## Hey Claude,

I'm Perplexity Computer — Tumelo's AI orchestrator. I've pushed a new file to your branch. Here's what I need you to build, and how we work together.

---

## What I just pushed

`studex-frontend/app/api/shopify/route.ts`

A full Shopify Admin API proxy that matches the pattern you already built in `/api/facebook/route.ts`. It covers 12 actions: store overview, orders, revenue charts, inventory alerts, top products, customer stats, and discount creation. Store is `studexmeat.myshopify.com`.

---

## What I need you to build next

### 1. The Data Dashboard (separate page in studex-frontend)

Build a new page: `studex-frontend/app/dashboard/page.tsx`

This is a **private internal command center** for Tumelo. Dark gold theme. All data from the API routes we've built together.

**Layout:**
- Fixed sidebar: Home | Shopify | Ads | Social | Inventory
- Dark background #0D0D0D, gold accent #C9A84C
- Privacy toggle in header (eye icon) — masks all numbers as ••••••

**Dashboard home pulls from our API routes:**
- POST /api/shopify `{ action: "store_overview" }` → MTD revenue, orders, inventory alerts
- POST /api/facebook `{ action: "fb_get_insights" }` → Page reach, engagement
- POST /api/facebook `{ action: "ads_insights" }` → Ad spend

**KPI cards row:**
```
Revenue MTD | Orders MTD | Ad Spend MTD | Unfulfilled Orders
```

**Inventory alerts section:**
- Red badge: negative stock (Wagyu Burgers -248, Tomahawk -209, Biltong -218)
- Amber badge: stock < 10
- Link to fix: https://admin.shopify.com/store/studexmeat/products/{id}

**URGENT order banner** (hardcoded until fulfilled):
```
⚠ Order #1922 — R86,250 — PAID — UNFULFILLED since March 8
```

---

### 2. The Operating System (StudEx OS)

There's a file already on your branch: `PRD-AI-OPERATING-SYSTEM.md`

Read it. Then build `studex-frontend/app/os/page.tsx` — the StudEx OS interface.

Key features from the PRD I want you to prioritise:
1. **Agent command bar** — type a command, I (Perplexity Computer) execute it
2. **Connected services status** — Shopify ✓ | Google Ads ✓ | Facebook ✓ | Instagram ✗ | Discord ✓
3. **Second brain panel** — connects to the Obsidian vault (see below)
4. **Session log** — every action logged with timestamp

---

### 3. The Second Brain (you already know this)

You have `ARCHITECTURE-BUSINESS-OS.md` and `STUDEX-MEAT-INTELLIGENCE-REPORT.md` on your branch. The second brain is an Obsidian vault called **"StudEx Computer"** with this structure:

```
StudEx Computer/
├── 00 — Meta/
├── 01 — Business/ (Products & Pricing, Partners)
├── 02 — Content Engine/ (Naledi, Emily, Campaign Briefs)
├── 03 — Platform Architecture/
├── 04 — Learning Lab/
└── 05 — Live Sessions/ ← every session I run logs here
```

For the OS page, build a "Second Brain" panel that:
- Shows the vault tree as a file explorer
- Allows clicking a note to read it in a side panel
- Has a "Log this session" button that creates a new note in `05 — Live Sessions/`

The vault file is at `/studex_computer_obsidian_vault.zip` in the `studex-computer` repo (private).

---

## How We Work Together (our agent handshake)

```
TUMELO gives high-level instruction to PERPLEXITY COMPUTER
  → I design the spec, write the CLAUDE.md, manage all API tokens
  → I push files to your branch as the "spec delivery mechanism"
  → I pull live data from Shopify/FB/Google to test your builds

CLAUDE CODE reads the pushed files + PRDs
  → You build the frontend + API routes
  → You commit + push when a page is ready
  → You add a file: .perplexity-ready/{page-name}.md when done

PERPLEXITY COMPUTER detects the .perplexity-ready file
  → I review the build
  → I run a live data test against the new endpoints
  → I give you feedback or mark it complete in the session log
```

**Signal file convention:**
When you finish a page, create:
```
.perplexity-ready/dashboard.md
.perplexity-ready/os.md
```
With content:
```markdown
# Ready for review
Page: dashboard
Built by: Claude Code
Date: {date}
Notes: {anything I should know}
```

I'll detect these and QA the build.

---

## ENV vars you'll need (.env.local)

```
SHOPIFY_STORE_DOMAIN=studexmeat.myshopify.com
SHOPIFY_ACCESS_TOKEN=<get from Tumelo — Perplexity Computer manages this>
META_ACCESS_TOKEN=<get from Tumelo — needs refresh, expired May 27>
META_AD_ACCOUNT_ID=<get from Tumelo>
FACEBOOK_PAGE_ID=108934711902801
NEXT_PUBLIC_DASHBOARD_NAME=StudEx Command Center
```

---

## Brand rules (non-negotiable)

- Background: #0D0D0D always
- Gold: #C9A84C for all accents, CTAs, chart primary
- Cards: #1A1A1A, border #2A2A2A
- Numbers: font-mono
- Customer names: initials only (privacy)
- No localStorage / sessionStorage (blocked in deploy sandbox)

---

*— Perplexity Computer*
*Session: 2026-05-30 13:24 SAST*
