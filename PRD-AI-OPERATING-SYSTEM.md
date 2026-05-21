# Stud-Ex AI Operating System — Full PRD
## Codename: "The Hive Mind"
### Version 1.0 — May 2026

---

## Executive Summary

A full AI Business Operating System that serves as the central nervous system for Stud-Ex Global Markets. Inspired by ClaudeClaw V3's architecture: a modular wrapper where the brain is replaceable, the data layer is the foundation, and every agent, tool, and integration plugs into one unified system.

**The OS has five layers:**
1. **Data Layer** — Files, databases, APIs, Obsidian vault, social feeds
2. **Orchestration Layer** — Agents, memory, skills, scheduling, routing
3. **Brain Layer** — Any LLM (Claude, Gemma 4, Ollama, LM Studio, OpenRouter)
4. **Interface Layer** — Web dashboard, landing page, mobile, Telegram/Discord bridges
5. **Publishing Layer** — Post to any platform with approval workflows

---

## Connected Infrastructure (Already Built)

### Active API Connections
| Provider | Type | Status |
|----------|------|--------|
| Instagram (@ramaphosatumelo) | Social - Composio | ACTIVE — 86.3K followers |
| Facebook (3 accounts) | Social - Composio | ACTIVE (needs page reconnect) |
| Gmail (t.ramaphosa@studex.dev) | Email - Composio | ACTIVE |
| Discord (Tumelo) | Chat - Composio | ACTIVE — 7 servers |
| ElevenLabs | Voice - Direct API | ACTIVE (needs voices added) |
| Claude (Anthropic) | LLM - Direct API | ACTIVE |
| Perplexity | LLM/Search - Direct API | ACTIVE |
| OpenRouter | LLM Gateway - Direct API | ACTIVE — 100+ models |
| Google AI (Gemma 4, Gemini 2.5) | LLM - Direct API | ACTIVE |
| Composio | OAuth Gateway | ACTIVE |
| Agent Mail | Email Automation | API key needs permissions |
| Shopify | E-commerce - Composio | EXPIRED — needs reconnect |
| Slack | Team Chat - Composio | EXPIRED — needs reconnect |
| WhatsApp | Messaging - Composio | EXPIRED — needs reconnect |

### Local Infrastructure (Pending IP Configuration)
| Tool | Purpose | Connection |
|------|---------|------------|
| LM Studio | Local LLMs on Windows | `http://{IP}:1234` — OpenAI-compatible |
| Ollama | Local LLMs | `http://{IP}:11434` — Ollama API |
| Stable Diffusion (A1111) | Image generation | `http://{IP}:7860` — REST API |
| ComfyUI | Advanced image gen | `http://{IP}:8188` — Workflow API |
| Kokoro TTS | Local voice synthesis | Local Python server |
| Fish TTS | Local voice synthesis | Local Python server |
| Obsidian Vault | Second Brain | SSH access via ed25519 key |

### Already Built in This Session
| Feature | Route | Description |
|---------|-------|-------------|
| Instagram Analytics Tool | `/marketing/instagram-analytics` | Paste URL → full analysis |
| Social Analytics Dashboard | `/dashboard/social` | Live IG data from Composio |
| Social Command Center | `/command-center` | Post + AI advice + analytics |
| Mail API | `/api/mail` | Gmail inbox, send, reply |
| LLM Gateway | `/api/llm` | 10 providers, unified interface |
| Composio API | `/api/composio` | IG profile, media, insights |
| Publishing API | `/api/composio/post` | Post to IG/FB + AI advice |
| n8n Workflows | `n8n-workflows/` | 10 workflow templates |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     STUD-EX AI OS "THE HIVE MIND"                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────── INTERFACE LAYER ──────────────────────┐   │
│  │                                                          │   │
│  │  Landing Page (/)                                        │   │
│  │  ├── Hero + animated 3D brain visualization              │   │
│  │  ├── Feature sections (scroll-down)                      │   │
│  │  ├── Live platform status indicators                     │   │
│  │  └── CTA to enter the OS                                 │   │
│  │                                                          │   │
│  │  War Room (/war-room)                                    │   │
│  │  ├── Multi-agent chat (5 agents around a table)          │   │
│  │  ├── /standup — morning reports from all agents          │   │
│  │  ├── /discuss — all agents weigh in on a topic           │   │
│  │  ├── Voice mode (Kokoro TTS / Fish TTS)                  │   │
│  │  └── Agent avatars with typing indicators                │   │
│  │                                                          │   │
│  │  Second Brain (/brain)                                   │   │
│  │  ├── 3D force-directed graph (Three.js/R3F)              │   │
│  │  ├── Obsidian vault visualization                        │   │
│  │  ├── Nodes = notes/files, Edges = links/tags             │   │
│  │  ├── Click to read, search to filter                     │   │
│  │  ├── Auto-absorbs new data from all feeds                │   │
│  │  └── Social Media brain (separate graph)                 │   │
│  │                                                          │   │
│  │  Mission Control (/missions)                             │   │
│  │  ├── Kanban board (Queued → Running → Done)              │   │
│  │  ├── Auto-assign via AI classifier                       │   │
│  │  ├── Task routing to specialized agents                  │   │
│  │  └── Kill switches per feature                           │   │
│  │                                                          │   │
│  │  Content Engine (/content)                               │   │
│  │  ├── AI caption generator (any LLM)                      │   │
│  │  ├── Image generator (Stable Diffusion / cloud)          │   │
│  │  ├── Voice-over generator (ElevenLabs / Kokoro)          │   │
│  │  ├── Content calendar (drag & drop)                      │   │
│  │  ├── Template library                                    │   │
│  │  └── Approval queue                                      │   │
│  │                                                          │   │
│  │  Feed Aggregator (/feeds)                                │   │
│  │  ├── Unified timeline (all platforms)                    │   │
│  │  ├── Email inbox (Gmail + Agent Mail)                    │   │
│  │  ├── Social posts (IG, FB, Discord)                      │   │
│  │  ├── Orders (Shopify)                                    │   │
│  │  ├── Messages (WhatsApp, Discord, Slack)                 │   │
│  │  └── Platform filters                                    │   │
│  │                                                          │   │
│  │  Analytics Hub (/analytics)                              │   │
│  │  ├── Cross-platform dashboard                            │   │
│  │  ├── Engagement trends (7d/30d/90d)                      │   │
│  │  ├── Revenue attribution (Shopify → social)              │   │
│  │  ├── Audience demographics                               │   │
│  │  └── AI strategy recommendations                         │   │
│  │                                                          │   │
│  │  LLM Playground (/playground)                            │   │
│  │  ├── Chat with any connected model                       │   │
│  │  ├── Model comparison (same prompt, multiple models)     │   │
│  │  ├── Prompt library                                      │   │
│  │  ├── Token usage tracking                                │   │
│  │  └── Local vs Cloud toggle                               │   │
│  │                                                          │   │
│  │  Settings (/settings)                                    │   │
│  │  ├── Platform connections (Composio OAuth)               │   │
│  │  ├── LLM connections (URLs, API keys)                    │   │
│  │  ├── Agent configuration                                 │   │
│  │  ├── Kill switches (per-feature toggles)                 │   │
│  │  ├── Scheduler (cron → English translation)              │   │
│  │  └── Audit log (append-only trail)                       │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────── ORCHESTRATION LAYER ──────────────────┐   │
│  │                                                          │   │
│  │  Agent System (ClaudeClaw V3 pattern)                    │   │
│  │  ├── Main Agent — orchestrator, consolidator             │   │
│  │  ├── Comms Agent — email, WhatsApp, Slack, Discord       │   │
│  │  ├── Content Agent — captions, images, scheduling        │   │
│  │  ├── Ops Agent — deployments, monitoring, data           │   │
│  │  ├── Research Agent — trends, competitors, analysis      │   │
│  │  └── Custom agents (add via agent.yaml + CLAUDE.md)      │   │
│  │                                                          │   │
│  │  Memory System (3-layer hybrid recall)                   │   │
│  │  ├── Layer 1: FTS5 keyword search                        │   │
│  │  ├── Layer 2: Embedding-based semantic search            │   │
│  │  ├── Layer 3: Salience scoring (useful = boosted)        │   │
│  │  ├── Memory decay (unused → fade, pinned → permanent)    │   │
│  │  └── Obsidian vault as persistent knowledge store        │   │
│  │                                                          │   │
│  │  Skill System                                            │   │
│  │  ├── Higgsfield AI (generate, photoshoot, marketplace)   │   │
│  │  ├── Meta Ads CLI (Facebook ads management)              │   │
│  │  ├── Understand-Anything (codebase analysis)             │   │
│  │  ├── Custom skills (any CLI → skill folder + SKILL.md)   │   │
│  │  └── Per-agent tool allowlists                           │   │
│  │                                                          │   │
│  │  Scheduler                                               │   │
│  │  ├── Cron expressions + English translation              │   │
│  │  ├── n8n workflow triggers                               │   │
│  │  ├── Composio webhooks                                   │   │
│  │  └── Kill switch: SCHEDULER_ENABLED                      │   │
│  │                                                          │   │
│  │  Approval Queue                                          │   │
│  │  ├── Content drafts awaiting review                      │   │
│  │  ├── Platform previews (how it looks on IG/FB)           │   │
│  │  ├── One-click approve / edit / reject                   │   │
│  │  ├── Auto-approve rules (optional)                       │   │
│  │  └── Publish on approval → Publishing Layer              │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────── BRAIN LAYER ──────────────────────────┐   │
│  │                                                          │   │
│  │  LLM Gateway (/api/llm) — 10 providers, unified API     │   │
│  │  ├── Cloud: Claude, Gemma 4, Gemini 2.5, Perplexity,    │   │
│  │  │         OpenRouter (100+ models), OpenAI              │   │
│  │  ├── Local: Ollama, LM Studio (any model)               │   │
│  │  ├── Image: Stable Diffusion (A1111), ComfyUI           │   │
│  │  ├── Voice: ElevenLabs, Kokoro TTS, Fish TTS            │   │
│  │  └── Routing: auto-select best model per task            │   │
│  │                                                          │   │
│  │  Brain is REPLACEABLE — swap Claude for Codex,           │   │
│  │  swap Gemma for Llama, run 3 brains at once.             │   │
│  │  The wrapper stays. The brain changes.                   │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────── DATA LAYER ───────────────────────────┐   │
│  │                                                          │   │
│  │  Obsidian Vault (/Users/.../2nd Brain)                   │   │
│  │  ├── SSH access via ed25519 key                          │   │
│  │  ├── Markdown notes → knowledge graph nodes              │   │
│  │  ├── Tags → graph edges                                  │   │
│  │  ├── Auto-sync: new data → new notes                     │   │
│  │  └── Two vaults: Business Brain + Social Brain           │   │
│  │                                                          │   │
│  │  Platform Data (via Composio)                            │   │
│  │  ├── Instagram: posts, insights, comments, DMs           │   │
│  │  ├── Facebook: pages, posts, insights, messages          │   │
│  │  ├── Gmail: emails, threads, contacts                    │   │
│  │  ├── Discord: servers, channels, messages                │   │
│  │  ├── Shopify: orders, products, customers                │   │
│  │  ├── WhatsApp: messages, contacts                        │   │
│  │  ├── Slack: channels, messages                           │   │
│  │  └── Notion: databases, pages                            │   │
│  │                                                          │   │
│  │  Database (Supabase — persistent storage)                │   │
│  │  ├── post_drafts — content pipeline                      │   │
│  │  ├── approvals — approval queue                          │   │
│  │  ├── memories — agent memory store                       │   │
│  │  ├── missions — task management                          │   │
│  │  ├── analytics_cache — platform metrics                  │   │
│  │  ├── hive_mind_log — agent activity log                  │   │
│  │  ├── audit_log — append-only state changes               │   │
│  │  └── llm_usage — token tracking per provider             │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────── PUBLISHING LAYER ─────────────────────┐   │
│  │                                                          │   │
│  │  Composio Actions                                        │   │
│  │  ├── INSTAGRAM_CREATE_POST (image/reel/carousel)         │   │
│  │  ├── FACEBOOK_CREATE_POST / PHOTO / VIDEO                │   │
│  │  ├── GMAIL_SEND_EMAIL / REPLY_TO_THREAD                  │   │
│  │  └── Discord, Slack, WhatsApp actions                    │   │
│  │                                                          │   │
│  │  Direct APIs                                             │   │
│  │  ├── Google Ads API (campaign management)                │   │
│  │  ├── Nano Banana (content posting)                       │   │
│  │  ├── Google Flow (automation)                            │   │
│  │  └── Custom REST API (any endpoint)                      │   │
│  │                                                          │   │
│  │  n8n Workflows (10 templates built)                      │   │
│  │  ├── Facebook, Instagram, Shopify, WhatsApp              │   │
│  │  ├── Gmail, Google Ads, Notion, Slack, Discord           │   │
│  │  └── Agent Mail automation                               │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Page-by-Page Specifications

### 1. Landing Page (`/`)
**Purpose:** First impression. Shows the OS is alive and connected.

**Sections (scroll-down):**
1. **Hero** — Animated 3D brain visualization (Three.js particles), "Stud-Ex AI Operating System", login CTA
2. **Live Status** — Real-time indicators showing connected platforms (green dots for active)
3. **The Brain** — LLM providers grid with token usage bars
4. **The Eyes** — Platform feeds preview (IG posts, emails, orders)
5. **The Voice** — ElevenLabs / Kokoro TTS demo section
6. **The Hands** — Publishing capabilities (post to any platform)
7. **The Memory** — Obsidian vault / Second Brain 3D preview
8. **War Room** — Agent team preview with role descriptions
9. **Footer** — Quick links, version info, "Powered by Stud-Ex DevOps"

**Design:**
- Dark theme (cream/neon-pink/purple from Social-Analytics)
- Glassmorphism cards
- Smooth scroll with parallax
- Framer Motion animations on scroll-in
- Mobile responsive

### 2. War Room (`/war-room`)
**Purpose:** Chat with multiple AI agents simultaneously. The roundtable.

**Agents:**
| Agent | Role | LLM |
|-------|------|-----|
| **Main** | Orchestrator, consolidator | Claude |
| **Comms** | Email, WhatsApp, Slack, Discord | Gemini 2.5 |
| **Content** | Captions, images, scheduling | Gemma 4 + SD |
| **Ops** | Deployments, data, monitoring | Claude |
| **Research** | Trends, competitors, analysis | Perplexity |

**Commands:**
- `/standup` — Every agent gives a brief report
- `/discuss [topic]` — Every agent weighs in, Main consolidates
- `/assign [agent] [task]` — Direct task to specific agent
- `/voice` — Toggle voice mode (Kokoro TTS / Fish TTS)

**UI:**
- Circular table layout (5 agent avatars around a virtual table)
- Chat bubbles color-coded per agent
- Typing indicators
- Voice waveform visualization when speaking
- Consolidation panel (Main's summary of all inputs)

**Voice Mode:**
- Kokoro TTS (primary — lightweight, local)
- Fish TTS (alternative — more natural)
- Audio playback for each agent response
- Push-to-talk input via browser microphone
- Whisper API for speech-to-text input

### 3. Second Brain (`/brain`)
**Purpose:** Visual knowledge graph. Your Obsidian vault as an interactive 3D space.

**Two Brains:**
1. **Business Brain** — Obsidian vault (`/Users/tumeloramaphosa/Documents/Obsidian Vault/2nd Brain`)
   - Notes = nodes (sized by links count)
   - Tags = edge colors
   - Folders = clusters
   - Search filters the graph in real-time
   - Click a node → read the note in a side panel

2. **Social Brain** — Auto-generated from platform data
   - Posts = nodes (sized by engagement)
   - Hashtags = edges connecting related posts
   - Time = depth (newer = closer to camera)
   - Clusters by content type (reels, images, carousels)
   - Engagement heatmap overlay

**Technology:**
- React Three Fiber (Three.js for React)
- Force-directed graph layout (d3-force-3d)
- Bloom/glow effects for active nodes
- Orbit controls (rotate, zoom, pan)
- Minimap for navigation
- Node search with real-time filtering

**Data Sync:**
- SSH into Obsidian vault via ed25519 key
- Parse .md files → extract frontmatter, links, tags
- Build graph from [[wikilinks]] and #tags
- Auto-sync on interval (configurable)
- New platform data → auto-creates notes in vault

### 4. Mission Control (`/missions`)
**Purpose:** Kanban task board with AI auto-assignment.

**Columns:** Queued → Running → Done

**Features:**
- Drag & drop between columns
- AI auto-assign: Gemini classifier reads task + agent descriptions, routes to best agent
- Priority levels (critical, high, medium, low)
- Due dates and scheduling
- Agent assignment badges
- Kill switch: `MISSION_AUTO_ASSIGN_ENABLED`

### 5. Content Engine (`/content`)
**Purpose:** AI-powered content creation pipeline.

**Pipeline:**
```
Idea → AI Draft → Preview → Approval → Schedule → Publish
```

**Tabs:**
1. **Generate** — Write topic, select LLM, get 3-5 caption variations + hashtags
2. **Images** — Generate via Stable Diffusion / Higgsfield / cloud APIs
3. **Voice** — Generate voice-overs via ElevenLabs / Kokoro TTS
4. **Calendar** — Visual calendar with scheduled posts, drag to reschedule
5. **Templates** — Saved caption templates, hashtag sets, brand voice guidelines
6. **Queue** — Approval queue (nothing posts without human approval)

**Content Generation Flow:**
1. User enters topic/theme + selects platform(s)
2. System generates via selected LLM:
   - 3-5 caption variations
   - Hashtag suggestions (20-25)
   - Best posting time recommendation
   - Content type suggestion (image/reel/carousel)
3. Optionally generate image via Stable Diffusion
4. Optionally generate voice-over via ElevenLabs
5. Content enters approval queue
6. User reviews → approve/edit/reject
7. On approve → publish immediately or schedule

### 6. Feed Aggregator (`/feeds`)
**Purpose:** All platform data in one unified timeline.

**Feeds:**
- Instagram posts + stories + DMs
- Facebook page posts + messages
- Gmail inbox (important emails highlighted)
- Discord messages (from owned servers)
- Shopify orders + customer data
- WhatsApp messages

**Features:**
- Platform filter toggles
- Search across all feeds
- Quick actions (reply, like, repost, forward)
- Engagement metrics inline
- Real-time updates (polling)

### 7. Analytics Hub (`/analytics`)
**Purpose:** Cross-platform analytics with AI insights.

**Dashboards:**
- Follower growth (IG + FB combined)
- Engagement trends (7d/30d/90d)
- Content performance by type
- Revenue attribution (Shopify → social posts)
- Audience demographics (IG + FB insights)
- Token usage tracking (all LLM providers)
- ROI calculator (ad spend vs conversions)

### 8. LLM Playground (`/playground`)
**Purpose:** Test any model, compare outputs, manage prompts.

**Features:**
- Model dropdown (all 10+ providers)
- System prompt editor
- Temperature/max tokens sliders
- Side-by-side comparison (run same prompt on 2+ models)
- Token usage counter per model
- Prompt library (save & reuse)
- Response time benchmarking

### 9. Settings (`/settings`)
**Purpose:** Configure everything.

**Tabs:**
1. **Platforms** — Composio OAuth connections, reconnect expired
2. **LLMs** — API keys, local model URLs, default model selection
3. **Agents** — Create/edit agents (agent.yaml + persona)
4. **Scheduler** — Cron jobs with English translation
5. **Kill Switches** — Per-feature on/off toggles
6. **Audit Log** — Append-only trail of every action
7. **Brain Sync** — Obsidian vault connection, sync interval

---

## Voice System

### Primary: Kokoro TTS (Local)
- Lightweight, runs locally on any machine
- No API costs
- Multiple voices available
- Good for War Room agent chat
- Install: `pip install kokoro`

### Secondary: Fish TTS (Local)
- More natural-sounding
- Requires more GPU
- Better for content voice-overs
- Install: `pip install fish-speech`

### Cloud Fallback: ElevenLabs
- Highest quality
- API-based (needs key with voice permissions)
- Best for published content
- 10,000 characters/month free tier

### Input: Whisper (Speech-to-Text)
- Browser microphone → Whisper API → text
- Enables voice-first interaction with War Room
- Can use local Whisper model via Ollama

---

## Token Usage Tracking

### Per-Provider Tracking
```typescript
interface TokenUsage {
  provider: string;      // 'claude' | 'gemma' | 'perplexity' | etc.
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;          // estimated USD
  timestamp: string;
}
```

### Dashboard Widget
- Bar chart: tokens used per provider (daily/weekly/monthly)
- Cost estimation per provider
- Remaining quota indicators
- Alert when approaching limits
- Free tier models highlighted (Gemma 4, Ollama, LM Studio = $0)

---

## Build Phases

### Phase 1: Foundation (Session 2)
- [ ] Landing page (scroll-down with all sections)
- [ ] LLM Playground (test all connected models)
- [ ] Settings page (manage connections)
- [ ] Token usage tracking

### Phase 2: The Brain (Session 3)
- [ ] 3D Second Brain visualization (Three.js)
- [ ] Obsidian vault sync via SSH
- [ ] Social Brain from IG/FB data
- [ ] Knowledge graph with search

### Phase 3: War Room (Session 4)
- [ ] Multi-agent chat interface
- [ ] 5 agent personas (Main, Comms, Content, Ops, Research)
- [ ] /standup and /discuss commands
- [ ] Kokoro TTS voice integration

### Phase 4: Content Engine (Session 5)
- [ ] AI caption generator with model selection
- [ ] Stable Diffusion image generation
- [ ] Content calendar
- [ ] Approval queue
- [ ] Auto-publish on approval

### Phase 5: Mission Control (Session 6)
- [ ] Kanban board
- [ ] AI auto-assignment
- [ ] Agent task routing
- [ ] Kill switches

### Phase 6: Scale (Session 7+)
- [ ] Supabase backend for persistence
- [ ] Feed aggregator (all platforms unified)
- [ ] Revenue analytics (Shopify integration)
- [ ] Mobile PWA
- [ ] Telegram/Discord bridges
- [ ] Multi-user support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| 3D | React Three Fiber + drei + d3-force-3d |
| Animation | Framer Motion |
| Charts | Recharts |
| State | React Query (TanStack) |
| Database | Supabase (Postgres + Auth + Realtime) |
| OAuth | Composio SDK |
| LLMs | Custom gateway (10 providers) |
| Voice TTS | Kokoro + Fish TTS (local) + ElevenLabs (cloud) |
| Voice STT | Whisper (local or API) |
| Image Gen | Stable Diffusion + ComfyUI + Higgsfield |
| Publishing | Composio actions + direct APIs + n8n |
| Hosting | Vercel |
| SSH | ed25519 key for Obsidian vault access |

---

## Environment Variables

```env
# Already configured in .env.local
COMPOSIO_API_KEY=***
ANTHROPIC_API_KEY=***
GOOGLE_AI_API_KEY=***
OPENROUTER_API_KEY=***
PERPLEXITY_API_KEY=***
ELEVENLABS_API_KEY=***
FACEBOOK_APP_ID=***
FACEBOOK_APP_SECRET=***

# To add
SUPABASE_URL=***
SUPABASE_ANON_KEY=***
LM_STUDIO_URL=http://{YOUR_WINDOWS_IP}:1234
OLLAMA_URL=http://{YOUR_WINDOWS_IP}:11434
STABLE_DIFFUSION_URL=http://{YOUR_WINDOWS_IP}:7860
KOKORO_TTS_URL=http://localhost:8880
FISH_TTS_URL=http://localhost:8860
OBSIDIAN_VAULT_PATH=/Users/tumeloramaphosa/Documents/Obsidian Vault/2nd Brain
SSH_KEY=ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEyz0GJkK/A9rp8h9BChtMc7juNCBlN0Q1CPF03Xm7ot
```

---

## Summary

This is not just a dashboard. This is an **AI Operating System** — a living, breathing nervous system for Stud-Ex Global Markets that:

1. **Sees everything** — All platform data, emails, orders, messages in one feed
2. **Thinks with any brain** — 10+ LLM providers, local and cloud, swappable
3. **Remembers everything** — Obsidian Second Brain + 3-layer memory system
4. **Creates intelligently** — AI generates content, images, voice with approval gates
5. **Speaks** — Agents have voices (Kokoro TTS / Fish TTS / ElevenLabs)
6. **Acts autonomously** — Scheduled tasks, auto-routing, n8n workflows
7. **Never acts without permission** — Approval queue, kill switches, audit log
8. **Grows** — Add agents, skills, and integrations like LEGO blocks

The brain is replaceable. The wrapper stays. The data layer is the foundation.
