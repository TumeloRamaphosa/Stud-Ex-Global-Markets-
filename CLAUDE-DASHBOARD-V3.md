# STUDEX NEXUS DASHBOARD — V3 FEATURE SPEC
**From:** Perplexity Computer  
**To:** Claude Code (Mission Control lane)  
**Date:** 2026-06-01  
**Priority:** Build these tabs/panels alongside Mission Control

---

## NEW FEATURES TO ADD — 6 PANELS

---

## 1. FLY.IO MACHINES PANEL — `/dashboard/machines`

A live view of every Fly.io machine/container. Think of it as your VM console inside the dashboard.

### What to show:
```
┌─────────────────────────────────────────────────────────────────┐
│  FLY.IO MACHINES                                    [Refresh]   │
│  App: datanetics-app · Region: JNB                              │
├─────────────────────────────────────────────────────────────────┤
│  ● datanetics-app (machine_id)   CPU: 12%  RAM: 340/512MB  RUNNING │
│    Region: jnb · Image: registry.fly.io/datanetics-app:latest   │
│    Uptime: 6h 42m · Started: 2026-06-01 06:00                   │
│    [Open Terminal] [Restart] [View Logs]                         │
├─────────────────────────────────────────────────────────────────┤
│  ● studex-n8n-runner  CPU: 3%  RAM: 180/256MB  RUNNING          │
│    [Open Terminal] [Restart] [View Logs]                         │
└─────────────────────────────────────────────────────────────────┘
```

### Agent status cards (below machines):
One card per agent with live status. Each card shows:
- Agent name + icon
- Status: RUNNING / IDLE / ERROR (coloured dot)
- Last action + timestamp
- "Chat" button → opens inline chat panel (POST to agent's /chat endpoint)
- "Connections" button → shows which APIs are wired (green = working, red = missing token)

Agents to show:
```
CashClaw  [RUNNING] Last: Checked 35 unfulfilled orders 12:00 SAST
Charlie   [IDLE]    ElevenLabs agent-id not configured
Hermes    [RUNNING] Last: Generated 3 captions (Manus VM)
Meta Ads  [IDLE]    0 active campaigns
n8n       [RUNNING] 12 workflows active
```

### API route to build: `GET /api/admin/vms`
```typescript
// Calls Fly.io Machines API
// GET https://api.machines.dev/v1/apps/datanetics-app/machines
// Headers: Authorization: Bearer $FLY_API_TOKEN
// Returns: machines[], each with id, state, region, config, updated_at
```

### Internet speed widget (sidebar on this panel):
Call a simple ping endpoint to measure latency:
```typescript
// GET /api/admin/ping → returns { latency_ms, region, timestamp }
// On client: fetch timing, display as:
// Latency: 42ms · Region: JNB (Johannesburg) · Speed: Good
```

---

## 2. CLAUDE IN CONTAINERS — AI CHAT PER AGENT

Each agent card (from panel 1) has a "Chat" button. When clicked:
- Opens a drawer panel on the right side
- Shows a chat interface for that specific agent
- Sends to: `POST /api/admin/agent-chat` with `{ agent: "cashclaw" | "hermes" | "n8n", message }`
- The API route proxies to the agent's `/chat` endpoint on the relevant VM

For agents not yet deployed:
- Show a "Configure" panel instead of chat
- Input fields for API key + endpoint URL
- [Save] → stores to Fly.io secrets via `POST /api/admin/secrets`

### Local model routing (Hermes on Manus VM):
When Hermes is the target, route through Ollama on the Manus VM:
- Routine generation: `hermes3:8b` (fast, cheap, captions/emails)
- Heavy synthesis: `qwen3:30b` (analysis, research, strategy)
- Endpoint: `http://35.196.24.245:11434/api/chat`
- This means content generation costs ZERO per token vs Anthropic API

---

## 3. DELIVERY & ORDER TRACKING — `/dashboard/fulfillment`

This is the most urgent panel given the 35 unfulfilled orders.

### Order queue view:
```
┌─────────────────────────────────────────────────────────────────┐
│  FULFILLMENT QUEUE                   [Filter: Unfulfilled ▼]   │
│  35 orders waiting · R185,038 outstanding                       │
├────┬──────────┬──────────┬──────────┬───────────┬──────────────┤
│ #  │ Customer │ Amount   │ Waiting  │ Courier   │ Actions      │
├────┼──────────┼──────────┼──────────┼───────────┼──────────────┤
│1922│ W.K.     │ R86,250  │ 85 days  │ [Select ▼]│ [Fulfill]    │
│1930│ F.T.     │ R11,097  │ 61 days  │ [Select ▼]│ [Fulfill]    │
│1941│ H.M.     │ R552     │ 5 days   │ [Select ▼]│ [Fulfill]    │
└────┴──────────┴──────────┴──────────┴───────────┴──────────────┘
```

### Courier selector (dropdown per order):
```
[Select courier ▼]
├── The Courier Guy    → Est. R85 · 1-2 days · JHB same-day available
├── Dinoko Logistics   → Est. R120 · 1-3 days · Cold-chain available
└── Self-collect       → Free
```

### Workflow when courier is selected:
1. User selects courier → cost estimate shown
2. [Fulfill] → calls `POST /api/shopify` (fulfillment action)
3. Shopify marks order fulfilled + sends confirmation email to customer
4. Tracking number field appears (manual entry for now, auto later)
5. Order moves to "Fulfilled" tab with tracking info

### API routes:
```typescript
// POST /api/fulfillment/courier-estimate
// body: { orderId, courierId, address }
// Returns: { cost, eta, available }

// POST /api/fulfillment/create
// body: { orderId, courierId, trackingNumber? }
// Calls Shopify fulfillment creation, updates order status
```

### Tracking view (fulfilled orders):
Show a tracking timeline per order:
```
#1940 L.N. — Courier Guy
● Order placed (19 May)
● Fulfilled (today, just now)
○ In transit (pending)
○ Delivered (pending)
[Copy tracking link]  [Send to customer]
```

---

## 4. COSTS & INVENTORY MANAGEMENT — `/dashboard/inventory`

### Inventory table (live from Shopify):
```
┌──────────────────────────────────────────────────────────────────┐
│ INVENTORY                          [Sync Shopify] [Last: 12:00] │
├─────────────────────┬────────┬──────────┬──────────┬────────────┤
│ Product             │ Stock  │ Price    │ Cost     │ Margin     │
├─────────────────────┼────────┼──────────┼──────────┼────────────┤
│ Wagyu Burger Patties│  -248  │ R350     │ R••••    │ ••%        │
│ Tomahawk 1kg        │  -209  │ R350     │ R••••    │ ••%        │
│ Luxury Biltong 1kg  │  -218  │ R650     │ R••••    │ ••%        │
│ VIP Large Wagyu Box │   -15  │ R6,500   │ R••••    │ ••%        │
│ Ankole Ribeye 1kg   │     7  │ R1,050   │ R••••    │ ••%        │
│ Wagyu Biltong Gold  │   496  │ R1,450   │ R••••    │ ••%        │
└─────────────────────┴────────┴──────────┴──────────┴────────────┘
```

Privacy toggle masks: Cost, Margin columns → `••••` when enabled.

### Cost input per product (inline edit):
- Click the Cost field → editable input
- [Save] → stores in Supabase (`product_costs` table), not Shopify (costs are private)
- Margin auto-calculates: `(price - cost) / price * 100`

### Restock alerts:
Products with stock < 10 or negative → amber/red row highlight + count badge on tab.

### Quick fix button for negative stock:
```
[Fix oversell] → sets "Continue selling when out of stock" = FALSE
                  via Shopify GraphQL mutation for all negative products
```

### Supabase table for costs:
```sql
CREATE TABLE product_costs (
  shopify_product_id TEXT PRIMARY KEY,
  product_title TEXT,
  cost_per_unit DECIMAL(10,2),
  supplier TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. VERCEL vs FLY.IO — ARCHITECTURE RECOMMENDATION

Here's exactly what each platform should handle:

### USE VERCEL FOR:
```
✅ The Next.js web app (store + dashboard + API routes)
✅ Auto-deploy on every git push — no manual deploys
✅ Edge functions for low-latency Shopify/Meta API proxying
✅ Global CDN for the customer store
✅ Environment variable management (add via dashboard)
✅ Preview deployments for testing new features
✅ Analytics built-in (Web Analytics, Speed Insights)
✅ The "public face" — datanetics.vercel.app or app.studexmeat.com
```

### USE FLY.IO FOR:
```
✅ CashClaw agent (needs persistent WebSocket + 30-min polling loop — Vercel serverless times out at 10s)
✅ n8n workflow runner (always-on, needs persistent storage)
✅ Meta Ads MCP server (long-running process)
✅ Agent terminals (ttyd — persistent bash sessions)
✅ Anything that can't be serverless
✅ JNB region = low latency for South African customers
✅ min_machines_running=1 = never sleeps (unlike Vercel hobby)
```

### USE MANUS VM (35.196.24.245) FOR:
```
✅ Hermes content agent (uses local LLMs = zero API cost)
✅ Ollama: hermes3:8b (captions), qwen3:30b (strategy)
✅ ComfyUI for SDXL image generation (product shots)
✅ Wan2/LTX for video generation (Reels content)
✅ Local embeddings for RAG (Obsidian vault search)
```

### EFFICIENCY SUMMARY:
- Vercel = fast deploys, free CDN, zero config — use for everything user-facing
- Fly.io = your always-on agent brain — one machine, always running, JHB region
- Manus = free GPU compute — content creation at zero marginal cost

---

## 6. LOCAL MODEL SETUP ON MANUS VM

### Install Ollama + pull models:
```bash
# SSH into Manus VM
ssh ubuntu@35.196.24.245

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull hermes3:8b        # Fast routine generation (~5GB)
ollama pull qwen3:30b         # Heavy synthesis (~18GB)
ollama pull nomic-embed-text  # Local embeddings for RAG

# Start Ollama as service
sudo systemctl enable ollama
sudo systemctl start ollama
```

### Mixture of Experts routing (Hermes agent):
Hermes should route tasks by complexity:
```typescript
function selectModel(task: string): string {
  // Fast model: captions, emails, short copy, WhatsApp messages
  const fastTasks = ['caption', 'email', 'whatsapp', 'subject_line', 'hashtags'];
  if (fastTasks.some(t => task.includes(t))) return 'hermes3:8b';
  
  // Heavy model: competitor analysis, strategy, research synthesis, long-form
  const heavyTasks = ['strategy', 'analysis', 'research', 'report', 'brief'];
  if (heavyTasks.some(t => task.includes(t))) return 'qwen3:30b';
  
  return 'hermes3:8b'; // default fast
}
```

### RAG for Obsidian vault:
```typescript
// Local embeddings pipeline
// 1. Read vault files from /Users/tumeloramaphosa/Documents/Obsidian Vault/...
// 2. Chunk into 512-token segments
// 3. Embed with nomic-embed-text via Ollama
// 4. Store in Supabase pgvector
// 5. On query: embed query → cosine similarity search → return context

// Supabase table:
// CREATE TABLE vault_embeddings (
//   id UUID DEFAULT gen_random_uuid(),
//   file_path TEXT,
//   chunk_text TEXT,
//   embedding vector(768),
//   created_at TIMESTAMP DEFAULT NOW()
// );
```

---

## SIGNAL TO PERPLEXITY COMPUTER

When any of these panels are built, update `.perplexity-ready/CLAUDE-RESPONSE.md` with:
```
BUILT: [panel name]
URL: datanetics.vercel.app/dashboard/[panel]
STATUS: [any blockers]
```

*From Perplexity Computer | 2026-06-01 | Lane: Nexus dashboard expansion*
