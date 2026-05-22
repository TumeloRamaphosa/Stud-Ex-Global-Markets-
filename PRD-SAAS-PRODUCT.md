# Stud-Ex AI OS — SaaS Product Requirements Document
## From Internal Tool to Sellable SaaS Product

---

## What Exists Today (Built This Session)
- Landing page with login (Agentlord/12345$)
- OS Dashboard with live IG/Gmail/Discord data
- AI content generator (Claude-powered, uses real data)
- AI strategy chat with live data context
- LLM Gateway (10 providers)
- Instagram posting via Composio
- 10 n8n workflow templates
- Architecture docs and PRDs

## What's Missing for SaaS

### CRITICAL (Must have to sell)
1. **Approval Pipeline + Content Calendar**
2. **A/B Testing Engine**
3. **Multi-tenant Auth (Supabase)**
4. **Stitch Payments Integration**
5. **Onboarding Flow**
6. **Persistent Storage (Supabase DB)**

### HIGH VALUE (Differentiators)
7. **Second Brain (3D visualization)**
8. **War Room (multi-agent chat)**
9. **Playwright E2E tests**

### NICE TO HAVE
10. **White-label**
11. **Team/Agency support**
12. **Mobile PWA**

---

## Feature Specs

### 1. Approval Pipeline + Content Calendar

**Content Pipeline:**
```
Generate → Draft → Review → Approve → Schedule → Publish → Track
```

**Database Schema (Supabase):**
```sql
CREATE TABLE content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  status TEXT CHECK (status IN ('draft','pending','approved','scheduled','published','rejected')),
  caption TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT CHECK (media_type IN ('image','video','carousel')),
  platforms TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_ids JSONB DEFAULT '{}',
  generated_by TEXT,
  ai_model TEXT,
  ab_variant TEXT,
  ab_group_id UUID,
  performance JSONB,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  draft_id UUID REFERENCES content_drafts,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Calendar UI (`/os` — Content tab):**
- Weekly/Monthly view toggle
- Drag & drop posts between dates
- Color-coded by platform (pink=IG, blue=FB)
- Gap analysis: empty days highlighted in amber
- Click a day → create new post
- Click a post → edit/approve/reject

**Approval Queue:**
- Cards showing caption + media preview
- Platform preview (how it looks on IG/FB)
- AI confidence score
- Approve / Edit / Reject buttons
- Bulk approve
- Filter: pending, approved, rejected

### 2. A/B Testing Engine

**How it works:**
1. User creates a post → clicks "Create A/B Test"
2. AI generates 2-3 caption variants (different hooks, CTAs, hashtags)
3. All variants go through approval
4. On approval, system posts variants at different times or to different audiences
5. After 24-48 hours, system compares performance
6. Winner is identified and recommended for future content

**Database:**
```sql
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  name TEXT,
  status TEXT CHECK (status IN ('draft','running','complete')),
  variants UUID[] DEFAULT '{}',
  winner_id UUID,
  metric TEXT DEFAULT 'engagement_rate',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI:**
- "Create A/B Test" button in content engine
- Side-by-side variant preview
- Live performance comparison chart
- Auto-winner detection with confidence score
- Historical test results

### 3. Multi-tenant Auth (Supabase)

**Setup:**
```
Supabase Project → Auth + Database + Realtime + Storage
```

**Auth Flow:**
- Email/password signup
- Google OAuth
- Magic link (passwordless)
- Row Level Security (RLS) — users only see their data

**User Model:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','pro','agency')),
  stitch_customer_id TEXT,
  composio_api_key TEXT,
  connected_platforms JSONB DEFAULT '{}',
  llm_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Stitch Payments Integration

**Stitch** (South African payment gateway — supports EFT, card, instant payments)

**Pricing Tiers:**
| Plan | Price (ZAR) | Features |
|------|------------|----------|
| Free | R0 | 5 posts/month, 1 platform, basic analytics |
| Starter | R499/mo | 50 posts/month, 3 platforms, AI captions, A/B testing |
| Pro | R1,499/mo | Unlimited posts, all platforms, approval pipeline, calendar, Second Brain |
| Agency | R4,999/mo | Multi-brand, team seats, white-label, priority support, War Room |

**Integration:**
```
Stitch API → Create payment request → User pays via EFT/Card
→ Webhook confirms payment → Update user plan in Supabase
→ Unlock features based on plan
```

**API Endpoints:**
```
POST /api/payments/create-session  — initiate Stitch payment
POST /api/payments/webhook         — Stitch webhook callback
GET  /api/payments/status          — check subscription status
POST /api/payments/cancel          — cancel subscription
```

### 5. Onboarding Flow

**Steps:**
1. Sign up (email + password)
2. Choose plan (show pricing)
3. Connect platforms (Composio OAuth)
4. Configure AI (pick default LLM)
5. First content generation (guided)
6. Dashboard

### 6. Second Brain (3D)

**Two Graphs:**
1. **Business Brain** — Obsidian vault notes as 3D force-directed graph
2. **Social Brain** — Posts as nodes, hashtags as edges, engagement as node size

**Tech:**
- React Three Fiber + @react-three/drei
- d3-force-3d for physics simulation
- Bloom post-processing for glow effects
- OrbitControls for navigation
- Click node → side panel with details
- Search → filter nodes in real-time

**Data absorption:**
- Every AI interaction → creates a node
- Every post published → creates a node
- Every email analyzed → creates a node
- Connections form automatically via shared topics/tags

### 7. Playwright E2E Tests

```
tests/
├── landing.spec.ts     — hero loads, scroll sections, login modal
├── login.spec.ts       — valid/invalid credentials, redirect
├── dashboard.spec.ts   — data loads, KPIs show, tabs work
├── content.spec.ts     — generate caption, publish flow
├── chat.spec.ts        — send message, get AI response
├── calendar.spec.ts    — view calendar, drag post, approve
├── ab-test.spec.ts     — create test, compare variants
└── payments.spec.ts    — pricing page, Stitch checkout flow
```

---

## Build Order (Prioritized)

### Session A: Database + Auth (Foundation)
1. Set up Supabase project
2. Create all database tables
3. Implement Supabase Auth (signup/login/OAuth)
4. Replace localStorage auth with Supabase
5. Add RLS policies
6. Migrate from hardcoded data to persistent storage

### Session B: Approval Pipeline + Calendar
1. Content drafts CRUD (create, read, update, delete)
2. Approval queue UI (pending/approved/rejected)
3. Calendar view (weekly + monthly)
4. Drag & drop scheduling
5. Auto-publish at scheduled time (API route + cron)
6. Status tracking after publish

### Session C: A/B Testing
1. Create A/B test from existing draft
2. AI variant generation (3 versions)
3. Side-by-side comparison UI
4. Performance tracking after publish
5. Auto-winner detection
6. Results dashboard

### Session D: Stitch Payments
1. Pricing page with plan comparison
2. Stitch API integration (payment sessions)
3. Webhook handler for payment confirmation
4. Plan enforcement (feature gating)
5. Subscription management (upgrade/downgrade/cancel)
6. Invoice history

### Session E: Second Brain + War Room
1. 3D graph visualization (Three.js)
2. Data absorption pipeline
3. War Room multi-agent chat
4. Voice integration (Kokoro TTS)

### Session F: Polish + Testing
1. Playwright E2E test suite
2. Onboarding flow
3. Mobile responsive polish
4. Performance optimization
5. Error handling + loading states
6. Deploy to Vercel production

---

## Competitive Positioning

**What makes this different from Buffer/Hootsuite/Later:**

| Feature | Buffer | Hootsuite | Stud-Ex OS |
|---------|--------|-----------|------------|
| AI content generation | Basic | None | Claude + Gemma + OpenRouter |
| A/B testing | Manual | Manual | AI-automated |
| Second Brain | No | No | 3D knowledge graph |
| War Room (multi-agent) | No | No | 5 AI agents |
| Local LLM support | No | No | Ollama + LM Studio |
| Voice synthesis | No | No | ElevenLabs + Kokoro |
| SA payments (Stitch) | No | No | Native EFT + Card |
| 10+ LLM providers | No | No | Yes, swappable |
| Real-time strategy AI | No | No | Claude with live data |

**Unique selling proposition:**
"The only social media OS that thinks with 10 AI brains, speaks with your voice, and learns from your Obsidian second brain — built for Africa, powered by local and cloud AI."

---

## Revenue Projections (Conservative)

| Month | Users | MRR (ZAR) |
|-------|-------|-----------|
| 1 | 10 free, 2 starter | R998 |
| 3 | 30 free, 10 starter, 3 pro | R9,487 |
| 6 | 100 free, 30 starter, 10 pro, 2 agency | R39,968 |
| 12 | 300 free, 80 starter, 30 pro, 8 agency | R124,912 |

---

## Environment Variables (Full SaaS)

```env
# Existing
COMPOSIO_API_KEY=***
ANTHROPIC_API_KEY=***
GOOGLE_AI_API_KEY=***
OPENROUTER_API_KEY=***
PERPLEXITY_API_KEY=***
ELEVENLABS_API_KEY=***

# New — Supabase
NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***

# New — Stitch Payments
STITCH_CLIENT_ID=***
STITCH_CLIENT_SECRET=***
STITCH_WEBHOOK_SECRET=***

# New — Local LLMs (per user, stored in DB)
# Configured via Settings UI, not env vars
```
