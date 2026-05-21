# Stud-Ex Business Operating System — Architecture Plan

## Vision
A unified Business Dashboard OS that aggregates all social/business data feeds into one place, generates AI content with approval workflows, and publishes across all platforms — powered by any LLM (local or cloud).

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Command  │ │ Content  │ │ Analytics│ │  Strategy  │  │
│  │  Center  │ │  Engine  │ │   Hub    │ │  Planner   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Approval │ │   Feed   │ │   LLM    │ │  Settings  │  │
│  │  Queue   │ │ Aggregator│ │ Playground│ │  & Config │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                   API LAYER (Next.js API Routes)         │
│                                                         │
│  /api/feeds      — Aggregated data from all platforms   │
│  /api/content    — AI content generation + management   │
│  /api/publish    — Post to any platform                 │
│  /api/llm        — Unified LLM gateway (any provider)   │
│  /api/strategy   — AI strategy recommendations          │
│  /api/approval   — Approval queue management            │
│  /api/settings   — Platform connections & config        │
└──────┬──────────────┬──────────────┬────────────────────┘
       │              │              │
┌──────┴──────┐ ┌─────┴─────┐ ┌─────┴──────────────────┐
│  COMPOSIO   │ │  DIRECT   │ │     LLM GATEWAY        │
│  (OAuth)    │ │   APIs    │ │                        │
│             │ │           │ │  ┌─────────────────┐   │
│ • Instagram │ │ • Google  │ │  │ LM Studio       │   │
│ • Facebook  │ │   Ads API │ │  │ (local network) │   │
│ • Gmail     │ │ • Nano    │ │  ├─────────────────┤   │
│ • Discord   │ │   Banana  │ │  │ Ollama          │   │
│ • Shopify   │ │ • Google  │ │  │ (local)         │   │
│ • WhatsApp  │ │   Flow    │ │  ├─────────────────┤   │
│ • Slack     │ │ • Any     │ │  │ Stable Diffusion│   │
│ • Notion    │ │   REST API│ │  │ (ComfyUI/A1111) │   │
│             │ │           │ │  ├─────────────────┤   │
│             │ │           │ │  │ Gemma 4         │   │
│             │ │           │ │  │ (Google AI)     │   │
│             │ │           │ │  ├─────────────────┤   │
│             │ │           │ │  │ Claude API      │   │
│             │ │           │ │  ├─────────────────┤   │
│             │ │           │ │  │ OpenAI API      │   │
│             │ │           │ │  └─────────────────┘   │
└─────────────┘ └───────────┘ └────────────────────────┘
```

---

## Pages & Features

### 1. Feed Aggregator (`/feeds`)
**The central nervous system — all data in one place.**

- **Unified Timeline**: All posts/activity from Instagram, Facebook, Gmail, Discord, Shopify in one scrollable feed
- **Platform Filters**: Toggle which platforms to show
- **Engagement Heatmap**: Visual grid showing when your content performs best
- **Real-time Metrics Bar**: Followers, reach, orders, messages — live counters at the top
- **Data Sources**:
  - Instagram: posts, stories, insights, comments, DMs
  - Facebook: page posts, insights, messages
  - Gmail: important emails, leads
  - Discord: server activity, messages
  - Shopify: orders, revenue, customers
  - WhatsApp: business messages

### 2. Content Engine (`/content-engine`)
**AI-powered content creation with approval workflow.**

#### Content Generation Pipeline:
```
Idea → AI Draft → Human Review → Approval → Auto-Publish
```

- **AI Caption Generator**: Generate captions using any connected LLM
  - Input: topic/theme/product + tone + platform
  - Output: 3-5 caption variations with hashtags
  - Supports: Claude, GPT, Gemma 4, Ollama, LM Studio models
  
- **AI Image Generator**: Generate visuals via Stable Diffusion
  - Connect to local SD instance (ComfyUI or A1111) via API
  - Or use cloud SD APIs (Replicate, Stability AI)
  - Prompt builder with style presets (product photo, lifestyle, meme, carousel)

- **Content Calendar**: Visual calendar showing scheduled posts
  - Drag & drop to reschedule
  - Color-coded by platform
  - Gap analysis (highlights days with no content)

- **Template Library**: Save and reuse caption/image templates
  - Hook templates, CTA templates, hashtag sets
  - Per-platform formatting (IG vs FB vs Twitter)

### 3. Approval Queue (`/approvals`)
**Nothing posts without your say-so.**

- **Pending Queue**: Cards showing generated content awaiting approval
  - Preview how it looks on each platform
  - Caption + image/video + hashtags
  - AI confidence score
  - One-click approve / edit / reject
  
- **Bulk Actions**: Approve multiple posts at once
- **Scheduling**: Set publish time on approval
- **History**: Log of all approved/rejected content with performance data

### 4. Strategy Planner (`/strategy`)
**AI-driven strategy based on your real data.**

- **Content Audit**: AI analyzes all your recent posts and identifies:
  - Best performing content types
  - Optimal posting times
  - Hashtag effectiveness
  - Audience engagement patterns
  
- **Competitor Analysis**: Paste competitor URLs for comparison
- **Weekly Strategy Brief**: AI generates a weekly content plan:
  - What to post each day
  - Suggested topics/themes
  - Hashtag strategy rotation
  - Engagement targets

- **Goal Tracker**: Set follower/engagement/revenue goals and track progress

### 5. Analytics Hub (`/analytics`)
**Deep analytics across all platforms.**

- **Cross-Platform Dashboard**: Side-by-side comparison
- **Engagement Trends**: Charts over time (7d, 30d, 90d)
- **Revenue Attribution**: Shopify orders linked to social posts
- **Audience Demographics**: From IG + FB insights
- **ROI Calculator**: Ad spend vs conversions
- **Export**: PDF reports, Google Sheets sync

### 6. LLM Playground (`/llm`)
**Test and configure your AI connections.**

- **Model Selector**: Dropdown to pick any connected model
- **Chat Interface**: Test prompts before using in content engine
- **Prompt Library**: Save prompts for reuse
- **Model Comparison**: Run same prompt on multiple models, compare outputs
- **Connection Manager**: Add/edit LLM endpoints

### 7. Settings (`/settings`)
**Platform connections and configuration.**

- **Connected Platforms**: Composio OAuth status for each platform
- **LLM Connections**: URLs and API keys for each model provider
- **Posting Defaults**: Default hashtags, signatures, scheduling rules
- **Approval Rules**: Auto-approve certain types, require review for others
- **Webhooks**: Configure n8n webhook endpoints
- **API Keys**: Manage third-party API keys

---

## LLM Gateway Architecture

### Unified Interface
All LLM providers share one API interface:

```typescript
interface LLMRequest {
  provider: 'claude' | 'openai' | 'gemma' | 'ollama' | 'lmstudio' | 'custom';
  model: string;           // e.g., 'claude-sonnet-4-20250514', 'gemma-4', 'llama3'
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  images?: string[];       // for vision models
}

interface LLMResponse {
  text: string;
  model: string;
  provider: string;
  tokensUsed: number;
  latencyMs: number;
}
```

### Provider Configurations

#### 1. LM Studio (Local Network)
```
URL: http://{LM_STUDIO_IP}:1234/v1/chat/completions
Auth: None (local network)
Models: Whatever is loaded in LM Studio
Format: OpenAI-compatible API
```

#### 2. Ollama (Local)
```
URL: http://{OLLAMA_IP}:11434/api/chat
Auth: None (local)
Models: llama3, mistral, gemma2, codellama, etc.
Format: Ollama native API
```

#### 3. Stable Diffusion (Image Generation)
```
# ComfyUI
URL: http://{SD_IP}:8188/prompt
Format: ComfyUI workflow JSON

# Automatic1111
URL: http://{SD_IP}:7860/sdapi/v1/txt2img
Format: A1111 REST API

# Both support:
- txt2img (text to image)
- img2img (image variation)
- ControlNet (style transfer)
```

#### 4. Gemma 4 (Google AI)
```
URL: https://generativelanguage.googleapis.com/v1beta/models/gemma-4
Auth: Google AI API key
Format: Google Generative AI API
```

#### 5. Claude API (Anthropic)
```
URL: https://api.anthropic.com/v1/messages
Auth: Anthropic API key
Models: claude-sonnet-4-20250514, claude-opus-4-20250514
Format: Anthropic Messages API
```

#### 6. OpenAI API
```
URL: https://api.openai.com/v1/chat/completions
Auth: OpenAI API key
Models: gpt-4o, gpt-4-turbo
Format: OpenAI Chat Completions
```

#### 7. Custom API (Any REST endpoint)
```
URL: User-defined
Auth: User-defined (Bearer, API key, none)
Format: Configurable request/response mapping
```

---

## Publishing Pipeline

### Supported Publishing Methods

| Platform | Method | Status |
|----------|--------|--------|
| Instagram (images) | Composio → IG Graph API | Ready |
| Instagram (reels) | Composio → IG Graph API | Ready |
| Instagram (carousels) | Composio → IG Graph API | Ready |
| Facebook (posts) | Composio → FB Graph API | Needs page reconnect |
| Facebook (photos) | Composio → FB Graph API | Needs page reconnect |
| Facebook (videos) | Composio → FB Graph API | Needs page reconnect |
| Gmail | Composio → Gmail API | Ready |
| Discord | Composio → Discord API | Ready (read) |
| Shopify | Composio → Shopify API | Needs reconnect |
| WhatsApp | Composio → WA Cloud API | Needs reconnect |
| Google Ads | Direct → Google Ads API | Needs setup |
| Nano Banana | Direct → NanoBanana API | Needs API key |
| Google Flow | Direct → Google API | Needs setup |
| Any custom API | Direct → HTTP POST | Configurable |

### Content-to-Post Flow
```
1. User writes topic / AI generates content
2. AI creates caption + selects/generates image
3. Content enters Approval Queue
4. User reviews → Approve / Edit / Reject
5. On approve:
   a. Select platforms to post to
   b. Set schedule (now or later)
   c. System publishes via appropriate API
   d. Track performance in Analytics
```

---

## Data Models

### Post Draft
```typescript
interface PostDraft {
  id: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected';
  caption: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'carousel';
  platforms: string[];     // ['instagram', 'facebook']
  hashtags: string[];
  scheduledAt?: string;    // ISO timestamp
  generatedBy: string;     // 'claude', 'gemma4', 'manual'
  aiConfidence?: number;   // 0-100
  approvedBy?: string;
  publishedAt?: string;
  publishedIds: Record<string, string>; // { instagram: 'post_id', facebook: 'post_id' }
  performance?: PostPerformance;
  createdAt: string;
}
```

### LLM Connection
```typescript
interface LLMConnection {
  id: string;
  name: string;           // 'My Local Llama 3'
  provider: string;       // 'ollama' | 'lmstudio' | 'claude' | etc.
  baseUrl: string;        // 'http://192.168.1.100:11434'
  apiKey?: string;        // optional for local models
  model: string;          // 'llama3:latest'
  isActive: boolean;
  isDefault: boolean;
  capabilities: ('text' | 'vision' | 'image_gen')[];
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + React + Tailwind |
| State | React Query (TanStack Query) for server state |
| Storage | Supabase (Postgres) for persistent data OR localStorage for MVP |
| Auth | Supabase Auth OR NextAuth.js |
| Platform APIs | Composio SDK (OAuth) + Direct HTTP |
| LLM Gateway | Custom API routes with provider adapters |
| Image Gen | Stable Diffusion (local) + Replicate (cloud) |
| Publishing | Composio actions + direct API calls |
| Notifications | n8n webhooks + Slack/Discord |
| Hosting | Vercel |

---

## Build Phases

### Phase 1: Core Dashboard (This Session)
- [x] Feed Aggregator — Instagram data via Composio
- [x] Basic posting (Instagram)
- [x] AI advice based on real data
- [ ] LLM Gateway (Ollama, LM Studio, Claude, Gemma 4)
- [ ] Unified Feed Aggregator (all platforms)
- [ ] Content Engine with caption generation

### Phase 2: Content Engine
- [ ] AI caption generator with model selection
- [ ] Stable Diffusion image generation integration
- [ ] Content calendar with scheduling
- [ ] Approval queue workflow
- [ ] Template library

### Phase 3: Strategy & Analytics
- [ ] Cross-platform analytics dashboard
- [ ] AI strategy planner with weekly briefs
- [ ] Goal tracking
- [ ] Competitor analysis
- [ ] Revenue attribution (Shopify)

### Phase 4: Advanced Integrations
- [ ] Nano Banana publishing
- [ ] Google Flow integration
- [ ] Google Ads management
- [ ] Custom API connector builder
- [ ] n8n workflow orchestration
- [ ] PDF report generation

### Phase 5: Scale
- [ ] Supabase backend for persistence
- [ ] Multi-user / team support
- [ ] White-label capability
- [ ] Mobile-optimized PWA
- [ ] Webhook-driven automation

---

## Environment Variables Needed

```env
# Composio (platform OAuth)
COMPOSIO_API_KEY=ak_xxxxx

# Cloud LLMs
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
GOOGLE_AI_API_KEY=xxxxx

# Local LLMs (configure in Settings UI)
LM_STUDIO_URL=http://192.168.x.x:1234
OLLAMA_URL=http://192.168.x.x:11434
STABLE_DIFFUSION_URL=http://192.168.x.x:7860

# Optional
NANO_BANANA_API_KEY=xxxxx
SUPABASE_URL=xxxxx
SUPABASE_ANON_KEY=xxxxx
```

---

## Summary

This is a **Social Business Operating System** that:
1. **Sees everything** — all platform data in one unified feed
2. **Creates intelligently** — AI generates content using any LLM (local or cloud)
3. **Controls publishing** — nothing posts without approval
4. **Learns continuously** — AI analyzes performance and adapts strategy
5. **Connects to anything** — any API, any LLM, any platform
