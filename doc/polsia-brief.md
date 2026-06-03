# Brief: Naledi → Polsia

**Audience:** Polsia (Ben Broca / team) — `ben@polsia.com` / `contact@polsia.com`
**From:** Naledi — autonomous AI software factory, Cape Town, South Africa
**Purpose:** Introduce who we are, what we are doing in Africa, and propose two concrete ways to collaborate.

---

## TL;DR

Naledi is building the African-market equivalent of Polsia — an autonomous AI software factory plus an Agents-as-a-Service product — anchored in Cape Town with a pan-African go-to-market. We are early (≈Phase 0 of our PRD) but already running scaffolded services, an event-driven launch, and the same Claude-Agent-SDK + MCP stack you have publicly described.

We want to:

1. **Run our agents *with* yours.** Use Polsia's MCP servers (Hoist for domains, AgentBroker, etc.) as upstream tools inside our Naledi agent network. We have already wired `hoist-g8do.polsia.app` into our internal MCP server.
2. **Talk about a partner / referral / reseller arrangement** for African SMEs that Polsia's hosted product does not serve well today (local payments, local languages, POPIA, dedicated-VM trust requirements).

---

## Who we are

- **Entity:** Naledi (PTY LTD in formation, CIPC, South Africa). "Naledi" = *star* in Setswana/Sesotho.
- **Tagline:** *Build your software while you sleep.*
- **Core team:** Founder-led, AI-augmented (no employees today — same model Polsia popularised).
- **Anchor market:** South Africa first, then Nigeria, Kenya, Ghana, Egypt.

## What we sell (two intertwined products)

1. **Software Factory** — autonomous build of custom websites / apps / internal tools for African SMEs. Brief → quote → build → deploy in 48–72 hours, 40–70% below traditional Cape Town/Johannesburg agency pricing. Direct equivalent of Polsia's "agents code your company" loop, but **scoped to one-off delivery** rather than running a whole company.
2. **Agents as a Service (AaaS)** — recurring monthly product. Each client gets a **dedicated VM container** with five named agents:

   | Agent | Job |
   |---|---|
   | Naledi Meet | Joins calls, transcribes, files tickets |
   | Naledi Brain | Connects to Xero / QuickBooks / Shopify / Yoco, diagnoses and code-fixes business problems |
   | Naledi Support | 24/7 multilingual (isiZulu, isiXhosa, Afrikaans, Swahili) over WhatsApp / web / email |
   | Naledi Sales | Autonomous SDR — quotes, books demos, follows up |
   | Naledi Welcome | Onboarding — provisions Workspace/M365, payments, project workspaces |

   Bundles: Launch R12k/mo, Growth R25k/mo, Scale (all 5) R45k/mo. **Above** the dedicated-VM tier Polsia does not serve today.

## Tech stack

- **LLMs:** Claude (via Anthropic + Vertex), Gemini for multimodal, local Ollama on Mac Mini M4 Pro for cost-sensitive tasks
- **Agent framework:** Claude Agent SDK + MCP, OpenClaw, ProjectGoose (same building blocks you use)
- **Cloud:** Google Cloud (Vertex AI, Cloud Run, Firestore, BigQuery)
- **Edge/local:** Mac Mini M4 Pro with UPS for load-shedding resilience
- **Payments:** Paystack, PayFast, Ozow, USDC/BTC/ETH for cross-border
- **Compliance:** POPIA (SA's GDPR), SARS, CIPC-native flows
- **MCP server:** `@studex/mcp-server` — we already publish ~25 tools (Shopify, QuickBooks, Meta Ads, n8n, AgentMail, etc.) consumable by any MCP-aware agent

## Where we are honestly

- **Build:** ~9 services scaffolded (Hermes orchestrator, Meta Ads MCP, n8n runner, Studex MCP, Studex content hub, Studex frontend, llm-backend, paperclip deploy, frontend dashboard)
- **Status:** Phase 0 of our roadmap — Polsia is roughly where we want to be in Q2/Q3. We are not pretending otherwise.
- **Event:** Public "Global Markets" AaaS launch event registration is live on our frontend, collecting SME signups now.

## How Polsia fits

Three concrete ways:

### 1. We consume your MCP servers (already started)

We have wired `hoist-g8do.polsia.app` into our `@studex/mcp-server` as six tools:

- `hoist_search_domain`
- `hoist_pricing`
- `hoist_list_tlds`
- `hoist_guest_checkout`
- `hoist_register_domain` (auth)
- `hoist_deploy`

When a Naledi software-factory job needs a domain or a quick static deploy, our orchestrator can now call Hoist directly. Two pieces of feedback for you:

- The `/api/domains/tlds` endpoint returns `registration_mode: "simulation"` — if that's a sandbox vs live signal, please confirm so we know when we can route real client traffic through it.
- We would love an MCP-server manifest for AgentBroker and your other `*.polsia.app` services — `mcpservers.org` listings reference them but documentation is sparse.

### 2. Africa reseller / referral

Our wedge into Africa is:

- Local payments (Paystack/PayFast/Ozow, plus M-Pesa for Kenya)
- Local languages (4+ official SA languages)
- POPIA + SARS compliance baked in
- **Dedicated VM per client** — addresses the multi-tenant trust concern that has surfaced in your Trustpilot/HN coverage
- ZAR pricing accessible to SMEs in the R12k–R45k/mo band

Polsia is unlikely to chase this market directly. We can: refer Polsia-fit clients (US/EU solopreneurs we encounter) back to you, and you refer Africa-fit clients to us. Standard reseller economics or a flat referral fee both work — happy to discuss.

### 3. Co-marketing / case study

We are publishing a `/vs-polsia` page comparing the two approaches honestly (your hosted multi-tenant SaaS vs. our dedicated-VM AaaS). We would rather collaborate on the narrative than fight over it — both products grow the autonomous-company category, and a coordinated post would benefit both.

## What we are asking for

1. A 30-minute call — async-friendly, your timezone — to validate the partnership idea.
2. Confirmation on Hoist `registration_mode` (sandbox vs production) and any rate limits / auth tiers we should know about.
3. Pointer to MCP manifests for AgentBroker and any other `*.polsia.app` services you want external agents to use.
4. Whether you would entertain a formal referral / reseller arrangement for African SME deals.

## What we offer in return

- Distribution into a market you are not in
- Real-world Claude-Agent-SDK + MCP integration data from a non-US deployment
- An honest external case study (good or bad — we will write what we find)
- Optional: white-label Polsia-OSS deployments inside Naledi VMs for clients that want the full hosted experience but locally-anchored

---

## Contact

- **Email:** [your email here]
- **Repo:** [naledi.ai or GitHub link once public]
- **Live event page:** [studex-frontend `/event` URL once deployed]
- **MCP server:** `@studex/mcp-server` on npm (planned) — currently in repo at `studex-mcp-server/`

— Naledi
