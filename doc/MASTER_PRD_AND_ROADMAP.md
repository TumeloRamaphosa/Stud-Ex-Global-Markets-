# NALEDI AI SOFTWARE FACTORY
## Master Product Requirements Document & Implementation Roadmap

**Version:** 1.0
**Date:** 2026-04-24
**Classification:** Internal — Strategic Planning
**Author:** AI Research Consortium (Sub-Agent Synthesis)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Vision & Concept](#2-vision--concept)
3. [Global Context: Dark Factories](#3-global-context-dark-factories)
4. [Market Opportunity](#4-market-opportunity)
5. [Platform Architecture](#5-platform-architecture)
6. [End-to-End Workflow](#6-end-to-end-workflow)
7. [Autonomous Business Operations](#7-autonomous-business-operations)
8. [Dedicated Dev Machine Setup](#8-dedicated-dev-machine-setup)
9. [Financial Model & Revenue](#9-financial-model--revenue)
10. [Go-to-Market Strategy](#10-go-to-market-strategy)
11. [Implementation Roadmap](#11-implementation-roadmap)
12. [Risk Register](#12-risk-register)
13. [Appendix: Document Index](#13-appendix-document-index)

---

## 1. EXECUTIVE SUMMARY

Naledi is a **fully-autonomous AI software factory** designed to build, test, deploy, and deliver production-grade software for SMEs across South Africa and Africa — with **zero human involvement** except payment approval and final sign-off.

**The Core Promise:**
- A client speaks to an AI avatar, uploads a brief, or describes their problem
- Within minutes, they receive a transparent cost and time estimate
- Upon payment, agents build the product in 48–72 hours
- The client receives live updates via chat/email and a deployed product

**Key Differentiators:**
1. **Price:** 40–70% below traditional Cape Town/Johannesburg agencies
2. **Speed:** MVP delivery in 48–72 hours vs. 4–12 weeks
3. **Autonomy:** Runs 24/7 on a hybrid cloud + local Mac Mini agent stack
4. **Local Context:** Speaks South African languages, integrates local payments, understands POPIA/SARS
5. **Pan-African Ready:** Hub-and-spoke model from SA base into Nigeria, Kenya, Ghana, Egypt

**Tech Stack:**
- **Cloud:** Google Cloud Vertex AI + Claude SDK + Cloud Run/GKE
- **Local:** Mac Mini M4 Pro with Ollama + LM Studio + OpenClaw + ProjectGoose
- **Code:** Python, TypeScript, Next.js, Firebase/Firestore, Pub/Sub
- **Payments:** Paystack, PayFast, Ozow, crypto (USDC/BTC/ETH)
- **Delivery:** Vercel, Netlify, GCP, App Store / Play Store via Fastlane

---

## 2. VISION & CONCEPT

### 2.1 The Problem

South African SMEs (and African SMEs broadly) face a software crisis:
- **18–22%** of formal SMEs have a functional, up-to-date website
- Custom development quotes from agencies range from **R15,000–R400,000**
- Projects take **4–12 weeks** to deliver
- SMEs default to fragmented DIY tools (Wix, WordPress, Shopify) that do not fit their workflows
- Load shedding, cash flow volatility, and distrust of offshore developers compound the problem

### 2.2 The Solution

Naledi acts as a **dark factory for software** — an autonomous production line where AI agents handle every step from requirement gathering to deployment.

**Human Touch Points (by design):**
1. Client interacts with AI avatar (no human needed)
2. AI generates quote (no human needed)
3. **Human approves payment** (only touchpoint)
4. Agents build, test, deploy (no human needed)
5. **Human does final sign-off** (optional — can be automated with confidence threshold)
6. Product ships (no human needed)

### 2.3 Naming & Brand

- **Naledi** — "Star" in Setswana/Sesotho. Represents guidance, light, and aspiration.
- **Tagline:** "Build your software while you sleep."
- **Entity:** PTY LTD registered in South Africa, CIPC.

---

## 3. GLOBAL CONTEXT: DARK FACTORIES

### 3.1 What Are Dark Factories?

"Dark factories" (mujin kojo in Japanese) are production facilities that run with the lights off — fully automated, no human workers on the floor. In software, this means:
- Agents write, review, test, and deploy code autonomously
- Humans only handle exception management, payment approvals, and strategic decisions
- Agent-to-human ratios range from **10:1 to 50:1**

### 3.2 Global Leaders

| Company / Platform | Origin | Model | Tools Used |
|-------------------|--------|-------|------------|
| **Cognition Devin** | USA | End-to-end autonomous SWE agent | Custom agent + GPT-4 |
| **Factory.ai** | USA | Multi-agent code generation | Claude, custom orchestration |
| **Sakana AI** | Japan | Multi-agent evolutionary systems | Custom LLMs + swarm intelligence |
| **Fujitsu Kozuchi** | Japan | Legacy code modernization | Proprietary AI + COBOL parsers |
| **Alibaba Tongyi Lingma** | China | Enterprise code assistant | Qwen LLM + internal tooling |
| **Baidu Comate** | China | IDE-integrated AI coding | Ernie LLM + Baidu Cloud |
| **ByteDance MarsCode** | China | Full-stack dev platform | Doubao LLM + CI/CD integration |
| **GitHub Copilot Workspace** | USA | Agentic PR generation | GPT-4 + GitHub Actions |
| **Google Jules** | USA | Multi-file editing agent | Gemini + Google Cloud |
| **Amazon Q Developer** | USA | Enterprise code transformation | Bedrock + CodeWhisperer |

### 3.3 Impact on Jobs & Productivity

**Productivity Gains:**
- GitHub Copilot users complete tasks **55% faster**
- Dark factory pilots show **30–50%** delivery time reductions
- SWE-bench autonomous bug-fix rates: **12–15%**

**Job Impact (by 2030):**
- Goldman Sachs: ~**300M jobs** exposed to AI automation globally
- WEF: **85M displaced** vs. **97M created** (net positive if reskilling occurs)
- McKinsey: ~**30% of hours** automated by 2030
- **Junior developers, QA testers, and DevOps operators** most at risk
- **AI supervisors, prompt engineers, and integration architects** are new growth roles

**Economic Positioning:**
- **Japan:** Society 5.0 initiative; up to **50% subsidies** for SME automation to offset demographic decline
- **China:** **$50B+** AI push; state-owned enterprise pilots; geopolitical positioning around autonomous production

### 3.4 What Naledi Learns From Global Leaders

1. **From Devin:** End-to-end autonomy is possible but needs robust error handling
2. **From Factory.ai:** Multi-agent orchestration beats single-agent monoliths
3. **From Japan:** Government subsidies accelerate SME adoption
4. **From China:** Scale requires state-grade infrastructure and massive training data
5. **From GitHub/Google:** IDE integration and cloud-native delivery are table stakes

---

## 4. MARKET OPPORTUNITY

### 4.1 South Africa (Primary Market)

**TAM:**
- ~2.5M SMEs total; ~350K–500K formal
- Annual SME software/digital spend: **R13–22 billion** (~$700M–$1.2B)
- Serviceable market (formal SMEs, 5+ employees): **80,000–120,000 businesses**

**Hottest Verticals:**

| Vertical | Pain Point | Current Spend | Naledi Opportunity |
|----------|-----------|---------------|-------------------|
| **Restaurants** | Aggregator commissions (20–30%), fragmented systems | R15k–R60k/yr | Branded ordering app at R12k–R25k |
| **Marketing Agencies** | White-label dev costs, slow turnaround | R30k–R150k/project | White-label sites at R8k–R20k |
| **Retail SMEs** | E-commerce setup, inventory sync | R20k–R80k setup | Shopify + custom in R10k–R30k |
| **Professional Services** | Client portals, CRM, booking | R10k–R50k setup | Custom portal in R8k–R18k |

**Pricing Gap:**
- Cape Town/Johannesburg agencies: R15k–R60k (websites), R80k–R400k (custom apps)
- Naledi target: **40–70% below** these benchmarks
- Margins preserved at **50–75%** due to near-zero labor cost

**Payment Preferences:**
1. Instant EFT (Ozow) — default for speed
2. Paystack/PayFast — cards and bank transfers
3. Milestone EFT for projects >R30k
4. Debit orders for subscription retainers

### 4.2 Pan-African Expansion

**Priority Markets (Ranked):**

| Rank | Country | Why | Entry Tactic |
|------|---------|-----|--------------|
| 1 | **Nigeria** | Largest economy, fintech boom, Flutterwave/Paystack native | Remote sales + local partner |
| 2 | **Kenya** | M-Pesa ubiquity, tech hub (Nairobi), English business | M-Pesa integration + Andela network |
| 3 | **Egypt** | 75% internet penetration, gov digitalization push | Arabic localization needed |
| 4 | **Ghana** | Stable democracy, Accra tech scene, English | Paystack Ghana + local reps |
| 5 | **Morocco** | 90% internet, tourism/BPO demand, Francophone | French localization + tourism vertical |

**Currency Strategy:**
- Anchor all pricing in **USD** for cross-border consistency
- Display in local currency (NGN, KES, EGP, GHS, MAD) via real-time FX API
- Accept local payment methods (M-Pesa, Flutterwave, Fawry, CMI)

### 4.3 Revenue Model

**Hybrid Model (Best for SA Cash Flow):**

| Tier | Description | Price | Target |
|------|-------------|-------|--------|
| **Starter** | Single-page website / landing page | R4,999–R9,999 one-time | Micro-SMEs, solopreneurs |
| **Growth** | Multi-page site + CMS + basic integrations | R12,000–R25,000 one-time | Restaurants, salons, clinics |
| **Pro** | Custom web app / SaaS MVP / mobile app | R35,000–R80,000 one-time + R2,500/mo hosting | Marketing agencies, fintechs |
| **Enterprise** | Multi-tenant SaaS, complex integrations | Custom quote (R100k+) | Corporate clients, franchises |
| **Retainer** | Support, updates, monitoring | R1,500–R5,000/month | All tiers post-delivery |

**Projected Year 1 Revenue (Conservative):**
- 10 projects/month average x R20,000 avg = **R200k/month = R2.4M/year**
- 20 retainer clients x R3,000 = **R60k/month = R720k/year**
- **Total Year 1: ~R3.1M** (~$167k USD)

**Projected Year 3 (With Pan-African):**
- 50 projects/month x R25,000 avg = R1.25M/month
- 100 retainer clients x R3,500 = R350k/month
- **Total Year 3: ~R19.2M/year** (~$1M USD)

---

## 5. PLATFORM ARCHITECTURE

### 5.1 High-Level Design

```
Client Layer: Web Portal / WhatsApp / Voice AI / Email (AgentMail.to)
                    |
Orchestration Layer: Vertex AI Agent Builder + LangGraph on GKE Autopilot
                    | Pub/Sub Event Bus
    Estimator Agent (Cloud Run)
    CodeGen Agent (Cloud Run / GKE)
    Test Agent (Cloud Build + GKE Sandbox)
    Deploy Agent (Cloud Deploy)
    Delivery Agent (Cloud Functions)
                    |
Artifact Layer: Cloud Storage / Artifact Registry / BigQuery
```

### 5.2 Agent Topology

| Agent | Runtime | Purpose | LLM |
|-------|---------|---------|-----|
| **Orchestrator** | GKE Autopilot (LangGraph) | Parses requirements, decomposes tasks, dispatches | Claude 3.5 Sonnet |
| **Estimator** | Cloud Run | Analyzes complexity, queries historical data, returns cost/time | Claude 3 Haiku (fast) |
| **Architect** | Cloud Run | Generates system design docs, tech stack recommendations | Claude 3.5 Sonnet |
| **CodeGen** | Cloud Run / GKE | Writes source code, reviews, refactors | Claude 3.5 Sonnet / Claude 3 Opus |
| **Test** | Cloud Build + GKE Sandbox | Unit tests, integration tests, security scans | Local models (cost control) |
| **Deploy** | Cloud Deploy | Canary/blue-green rollouts to Cloud Run / GKE | N/A (infra) |
| **Delivery** | Cloud Functions | Packages artifacts, sends notifications, provisions access | Claude 3 Haiku |

### 5.3 Claude SDK Integration

**Dual-Path Setup:**
1. **Primary:** Claude via Vertex AI Model Garden (lower latency, GCP-native billing, enterprise SLA)
2. **Fallback:** Direct Anthropic API via Cloud Run proxy (access to latest features, higher token limits)

**Best Practices:**
- Use **tool use / function calling** for structured outputs (JSON requirements, cost estimates)
- Implement **repository-map hydration** — feed the agent a map of the codebase before multi-file edits
- **Long-context chunking** for projects >100k tokens; use RAG memory in Vertex AI Vector Search
- **Multi-turn reasoning** with explicit planning steps before code generation

### 5.4 Security & Isolation

| Layer | Mechanism |
|-------|-----------|
| **Network** | VPC-SC, private Google Access, Cloud Armor |
| **Compute** | GKE namespaces, NetworkPolicy, gVisor sandbox for builds |
| **Data** | CMEK (Customer-Managed Encryption Keys), Firestore ACLs |
| **Code** | SLSA-3 supply chain, Artifact Registry vulnerability scanning |
| **Tenant** | Isolated Cloud Run services per client for preview deployments |

### 5.5 CI/CD for Agent-Generated Code

```
Agent outputs code -> GCS trigger -> Cloud Build ->
  |- Lint (ESLint/Prettier, Ruff, mypy)
  |- Unit tests (pytest, Jest)
  |- Integration tests (Playwright, Postman)
  |- Security scan (Snyk, Artifact Registry scanning)
  |- POPIA compliance check (PII detection)
  |- Deploy via Cloud Deploy (canary -> 100%)
```

---

## 6. END-TO-END WORKFLOW

### 6.1 Client Journey Map

| Stage | Duration | Human Touch? | Output |
|-------|----------|--------------|--------|
| **Discovery** | 5–15 min | No | Structured requirements JSON |
| **Cost Analysis** | < 2 min | No | Transparent quote in ZAR/USD |
| **Payment** | 1–5 min | **Yes — approve** | Escrow funded, invoice generated |
| **Build — Milestone 1** | 24–48 hrs | No | Preview URL + test suite |
| **Client Review** | 24 hrs (async) | No | Feedback or approval |
| **Iteration** | 4–8 hrs | No | Updated preview |
| **Build — Milestone 2** | 12–24 hrs | No | Feature-complete beta |
| **Final QC** | 4–6 hrs | No | Security scan + POPIA check |
| **Final Sign-off** | 1–2 min | **Yes — approve** | Release from escrow |
| **Delivery** | < 1 hr | No | Live product + docs + training vids |
| **Support** | Ongoing | No (agent) | WhatsApp chat + email updates |

### 6.2 Communication Channels

- **Primary:** WhatsApp Business API (async updates, milestone pings)
- **Secondary:** Email (AgentMail.to — auto-generated progress reports)
- **Tertiary:** Web dashboard (preview URLs, file uploads, revision requests)
- **Voice:** AI avatar for initial discovery only (reduces friction for non-tech clients)

### 6.3 Quality Control Gates

```
Lint -> Unit Tests -> Integration Tests -> Security Scan -> POPIA Check -> Human Final Sign-off
```

- **Automated gates:** All must pass before delivery
- **Human gates:** Only at payment and final sign-off
- **Escalation:** If any gate fails 3x, route to human supervisor queue

---

## 7. AUTONOMOUS BUSINESS OPERATIONS

### 7.1 AgentMail.to Setup

**What it is:** A dedicated email identity (`build@naledi.ai`) that ingests, classifies, and auto-responds to client communication.

**Implementation:**
- Register domain: `naledi.ai`
- Google Workspace or Microsoft 365 with API access
- Gmail API / Microsoft Graph for webhook-driven ingestion
- NLP classifier tags intents: `quote`, `build`, `support`, `complaint`
- Auto-reply with confidence threshold >=0.85; queue for human review below

**Daily Loop:**
```
Email arrives -> Classify intent -> Match to project -> Draft response ->
[quote] -> Generate estimate -> Send to client
[build] -> Check payment status -> Trigger pipeline
[support] -> Search KB -> Auto-reply or create ticket
[complaint] -> Escalate to human queue immediately
```

### 7.2 Payment Infrastructure

**South Africa:**

| Provider | Use Case | Integration |
|----------|----------|---------------|
| **Paystack** | Primary card/bank payments | REST API + webhooks |
| **PayFast** | SA consumer trust | ITN webhooks |
| **Ozow** | Instant EFT (default) | Callback API |
| **Investec** | Business banking + API | Programmable Banking SDK |

**Milestone Escrow (30/40/30):**
- 30% on contract acceptance
- 40% on beta delivery
- 30% on final sign-off
- Webhook listener auto-reconciles payments and gates CI stages

**Crypto Payments:**
- Accept: USDC (primary), BTC, ETH
- Wallet: Gnosis Safe (multisig, 2-of-3 signers)
- Detection: Alchemy / BlockCypher APIs
- Off-ramp: VALR Business or Luno Business -> ZAR
- **Tax:** SARS treats crypto as intangible asset; record FMV at receipt; CGT on disposal

### 7.3 Legal & Accounting Automation

**Company Structure:**
- **PTY LTD** registered with CIPC
- **Directors:** Minimum 1 human (legal requirement); AI can be "CEO" in practice but human holds legal liability
- **B-BBEE:** Plan for Level 4+ via ownership, skills development, and enterprise development

**Automated Accounting:**
- **Xero API:** Auto-sync invoices, payments, expenses
- **Bank feeds:** Investec/FNB API -> auto-categorization
- **Tax:** Xero calculates VAT; human submits SARS eFiling (semi-automated)

---

## 8. DEDICATED DEV MACHINE SETUP

### 8.1 Hardware: Mac Mini "Agent Node"

**Spec:**
- **Mac Mini M4 Pro** (12-core CPU, 16-core GPU) or M2 Pro
- **32GB unified memory** minimum (to run multiple local LLMs)
- **1TB SSD** (models, code repos, build artifacts)
- **Gigabit ethernet** (stable connection for cloud sync)
- **UPS battery backup** (load-shedding resilience for SA)

**Why Mac Mini:**
- Silent, low power, runs 24/7
- Excellent local LLM inference via Apple Silicon (MLX framework)
- Native Unix environment for development tools

### 8.2 Local LLM Stack

**Ollama:**
```bash
brew install ollama
ollama pull qwen2.5-coder:14b
ollama pull deepseek-coder:6.7b
ollama pull codellama:7b
ollama serve  # API on :11434
```

**LM Studio:**
- Run on port `1234` for secondary model serving
- Load smaller models for fast tasks; larger models for complex generation
- Enable API server mode for programmatic access

### 8.3 OpenClaw + ProjectGoose

**OpenClaw** (autonomous coding agent):
```bash
git clone https://github.com/openclaw/openclaw
pip install -e .
# Configure to point at local Ollama
```
- Runs as persistent `launchd` service
- Connects to local LLMs for code generation
- Complements cloud-based Claude for cost-sensitive tasks

**ProjectGoose** (Block agent framework):
```bash
brew install goose
# Or: npm install -g @block/goose
```
- Integrates with VS Code / Cursor via MCP
- Can switch between local Ollama and cloud Claude
- Best for interactive debugging and complex refactoring

### 8.4 IDE Setup

**Recommended:** VS Code + Continue.dev extension
- Continue.dev connects to Ollama, LM Studio, and Claude API simultaneously
- MCP server integration allows Goose to control the editor
- Headless operation possible via CLI for pure agent workflows

**Alternative:** Cursor (AI-native editor)
- Better out-of-box experience
- Less flexible for multi-model switching

### 8.5 Autonomous Operation

**Auto-Restart:**
- Create `~/Library/LaunchAgents/com.naledi.agent.plist`
- Set `KeepAlive` = true and `RunAtLoad` = true
- Script at `/opt/naledi/start-agents.sh` restarts all services

**Remote Access:** Tailscale VPN for secure remote monitoring
**Monitoring:** `logrotate` + CloudWatch/Cloud Logging agents
**Resilience:** UPS + `pmset` wake-on-power for load shedding recovery

---

## 9. FINANCIAL MODEL & REVENUE

### 9.1 Cost Structure (Monthly)

| Line Item | Cost (ZAR) | Cost (USD) |
|-----------|-----------|------------|
| GCP (Vertex AI, Cloud Run, Firestore) | R8,000–R15,000 | $430–$810 |
| Claude API (cloud usage) | R5,000–R12,000 | $270–$650 |
| Mac Mini + UPS + internet | R2,500 | $135 |
| Domain, email, tooling | R800 | $43 |
| Paystack/PayFast fees (2.5–3.5%) | Variable | Variable |
| Xero accounting | R1,200 | $65 |
| **Total Fixed Costs** | **~R17,500–R31,500** | **~$945–$1,700** |

### 9.2 Unit Economics

| Metric | Value |
|--------|-------|
| Average project price | R20,000 |
| Agent cost per project | ~R800 (cloud tokens + compute) |
| Gross margin per project | **~96%** |
| Break-even | **1 project/month** |
| Target | 10+ projects/month for R200k revenue |

### 9.3 Year 1–3 Projections

| Year | Projects/Month | Avg Price | Monthly Revenue | Annual Revenue | Margin |
|------|---------------|-----------|-----------------|----------------|--------|
| 1 | 10 | R20k | R200k | R2.4M | ~85% |
| 2 | 25 | R22k | R550k | R6.6M | ~88% |
| 3 | 50 | R25k | R1.25M | R15M+ | ~90% |

---

## 10. GO-TO-MARKET STRATEGY

### 10.1 Primary Channels (South Africa)

**Phase 1 (Months 1–3): Local Validation**
- **Restaurants:** Direct outreach via Instagram/WhatsApp. Offer "R4,999 online ordering app" limited launch price.
- **Marketing agencies:** LinkedIn DM + cold email. Position as white-label dev partner.
- **Referral loop:** R1,000 credit for every referred client.

**Phase 2 (Months 4–6): Scale**
- **Google Ads:** "Website in 48 hours" + location targeting (Cape Town, Johannesburg, Durban)
- **Facebook/Instagram:** Visual ads showing before/after of AI-built sites
- **Partnerships:** Yoco, Lightspeed, Shopify — integration partner referrals

**Phase 3 (Months 7–12): Pan-African**
- **Nigeria:** Partner with Flutterwave for co-marketing
- **Kenya:** M-Pesa integration as headline feature
- **Content:** YouTube/TikTok showing AI building real projects in real-time

### 10.2 Larry Marketing Skill (Traffic Generation)

The "Larry" marketing skill framework for automated traffic:

**L — Lead Magnets:**
- Free "AI Website Audit" tool — scans any URL and reports issues
- "Cost Calculator" — estimates dev cost in 30 seconds

**A — Automation:**
- Auto-post case studies to Instagram/LinkedIn after each project delivery
- AI-generated blog content (SEO-optimized) published via Ghost/WordPress API
- Retargeting pixel on every visitor; AI optimizes ad spend daily

**R — Referrals:**
- Every client gets a unique referral link
- Auto-generated "share your project" social cards
- Affiliate payouts via Paystack Transfer

**R — Retention:**
- Monthly "health check" AI email to all clients
- Auto-detect when a client site needs updates (SSL expiry, plugin updates)
- Upsell campaigns for new features

**Y — Yield:**
- A/B test pricing continuously
- Dynamic pricing based on demand queue length
- Surge pricing for rush jobs (delivery in 24 hours)

### 10.3 Trust-Building Tactics

- **Live build cam:** Public dashboard showing current projects being built (anonymized)
- **Money-back guarantee:** 100% refund if not delivered in quoted time
- **POPIA badge:** Prominent compliance certification on all pages
- **Local phone number:** +27 number routed to AI voice agent

---

## 11. IMPLEMENTATION ROADMAP

### Phase 0: Foundation (Weeks 1–4)

**Goals:** Legal entity, core infra, first agent pipeline

| Week | Task | Deliverable |
|------|------|-------------|
| 1 | Register PTY LTD, domain, bank account | CIPC cert, `naledi.ai` live |
| 1 | Set up Mac Mini with Ollama + LM Studio | Local agent node operational |
| 2 | GCP project + Vertex AI + Firestore | Cloud infra baseline |
| 2 | Deploy frontend (Next.js) to Vercel | Landing page + quote form |
| 3 | Build estimator agent + payment webhooks | Quote engine + Paystack integration |
| 3 | Claude SDK integration (Vertex AI) | CodeGen agent v1 |
| 4 | End-to-end test: brief -> quote -> build -> deploy | First demo project built entirely by AI |

### Phase 1: MVP Launch (Weeks 5–8)

**Goals:** 5 paying clients, workflow validation

| Week | Task | Deliverable |
|------|------|-------------|
| 5 | WhatsApp Business API integration | Client chat on WhatsApp |
| 5 | AgentMail.to setup (`build@naledi.ai`) | Auto-email pipeline |
| 6 | CI/CD pipeline (Cloud Build + Deploy) | Automated testing & deployment |
| 6 | Onboard 5 beta clients at 50% discount | Case studies + testimonials |
| 7 | Xero integration for auto-invoicing | Automated billing |
| 8 | Refine based on feedback + launch public | Public pricing page + "Order" button |

### Phase 2: Scale (Months 3–6)

**Goals:** 10+ projects/month, automated marketing

- Implement Larry marketing automation
- Launch Google Ads + Meta campaigns
- Onboard 2–3 marketing agency white-label partners
- Add crypto payment option
- Build internal dashboard for monitoring all agent activity

### Phase 3: Pan-African (Months 7–12)

**Goals:** Nigeria + Kenya live, 25+ projects/month

- Localize for Nigerian market (NGN pricing, Flutterwave)
- M-Pesa integration for Kenya
- Arabic/French localization for Egypt/Morocco
- Hire 1 sales rep per market (commission-only initially)
- Apply for startup grants (SEDA, DTIC, local fintech accelerators)

### Phase 4: Full Autonomy (Year 2)

**Goals:** 90%+ projects need zero human involvement

- AI avatar with voice (ElevenLabs + Twilio)
- Auto-detect when client needs upsell (site traffic analysis)
- Self-healing infrastructure (auto-scale, auto-repair)
- Expand to 10 African countries

---

## 12. RISK REGISTER

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Code quality failures** | Medium | High | Multi-layer QC gates, human final sign-off, money-back guarantee |
| **Payment fraud / chargebacks** | Medium | Medium | Escrow model, milestone releases, crypto irreversible payments |
| **Load shedding (SA)** | High | Medium | UPS + Mac Mini on battery, async cloud agents unaffected |
| **Claude/Vertex AI downtime** | Low | High | Local Ollama fallback, retry logic, queue-based architecture |
| **POPIA / data compliance breach** | Low | Very High | Automated PII scanning, VPC-SC, legal review of all data flows |
| **Client trust / adoption** | Medium | High | Live demos, testimonials, escrow payments, local phone number |
| **Competition from global AI dev tools** | High | Medium | Local context advantage, local payments, African language support |
| **Agent hallucination / wrong builds** | Medium | High | Structured requirements JSON, explicit approval gates, iteration limits |
| **Cash flow (SA SME seasonality)** | Medium | Medium | Hybrid model (upfront + retainer), diversified client base |
| **Crypto regulatory changes** | Low | Medium | Primary focus on ZAR/USD fiat; crypto as optional extra |

---

## 13. APPENDIX: DOCUMENT INDEX

All research and design documents generated by sub-agents:

| Document | File | Purpose |
|----------|------|---------|
| **Global Software Factories Report** | `AGENT_SOFTWARE_FACTORIES_REPORT.md` | Japan, China, Global Top 20 dark factories |
| **Enterprise Architecture** | `software-factory-architecture-report.md` | Vertex AI + Claude SDK technical design |
| **Workflow Design** | `doc/ai-software-factory-workflow.md` | End-to-end operational playbook |
| **SA Market Analysis** | `doc/sa-market-analysis.md` | TAM, pricing, competitive landscape |
| **Dark Factory Impact** | `doc/dark-factory-impact-report.md` | Jobs, productivity, economic impact |
| **Mac Mini Setup** | `doc/mac-mini-agent-setup.md` | Local agent stack installation guide |
| **Autonomous Workspace** | `doc/autonomous-agent-workspace.md` | AgentMail, banking, crypto, legal |
| **Pan-African GTM** | `doc/pan-african-gtm.md` | Expansion strategy across 10 countries |
| **Master PRD** | `doc/MASTER_PRD_AND_ROADMAP.md` | This document — strategic synthesis |

---

## NEXT STEPS

1. **Review this PRD** — Mark sections for revision or approval
2. **Prioritize Phase 0** — Start with PTY LTD registration and Mac Mini procurement
3. **Build v0.1** — Implement the quote estimator + payment flow first (highest leverage)
4. **Validate with 3 real clients** — Offer free builds in exchange for detailed feedback
5. **Iterate** — Use this PRD as a living document; update weekly as you learn
