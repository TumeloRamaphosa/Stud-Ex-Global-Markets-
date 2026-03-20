# Product Requirements Document (PRD)
# Studex Marketing Skill App — AI-Powered Automated Marketing Platform

**Version:** 1.0.0
**Date:** 2026-03-20
**Status:** Draft
**Author:** Studex Global Markets Engineering

---

## 1. Executive Summary

The Studex Marketing Skill App integrates the **Upload-Post Larry Marketing Skill** methodology into the Studex Global Markets platform, providing an AI-powered automated marketing pipeline for TikTok/Instagram slideshow creation, multi-platform distribution, analytics tracking, and data-driven content optimization.

This app automates what Larry's methodology proved at scale: **7M+ views, 1M+ TikTok views, and $670/month MRR** — making this repeatable and accessible to Studex platform users (investors, entrepreneurs, and verified traders) to market their deals, assets, and businesses.

---

## 2. Problem Statement

### Current Pain Points
1. **Manual content creation** — Users spend hours creating marketing content for deals/assets
2. **No cross-platform strategy** — Content is siloed to one platform at a time
3. **No data-driven iteration** — Users guess what works instead of using analytics
4. **Inconsistent posting** — Sporadic marketing reduces algorithmic reach
5. **No conversion tracking** — Users can't connect marketing spend to actual revenue

### Opportunity
By embedding the Larry Marketing Skill into Studex, platform users get an automated marketing engine that handles the full funnel: research → create → post → track → optimize → repeat.

---

## 3. Goals & Success Metrics

### Primary Goals
| Goal | Metric | Target |
|------|--------|--------|
| Automate content pipeline | Posts created per user per week | 21+ (3x daily) |
| Multi-platform reach | Platforms posted per campaign | 5+ simultaneously |
| Data-driven optimization | Analytics-informed content adjustments | Daily reports |
| User engagement | Monthly active marketing users | 50+ within 3 months |
| Revenue attribution | Conversion tracking enabled | >60% of campaigns |

### Secondary Goals
- Reduce content creation time from hours to minutes
- Provide competitor research insights per niche
- Enable A/B testing of hooks, CTAs, and visual styles
- Build reusable content templates for Studex deal categories

---

## 4. User Personas

### Persona 1: Deal Promoter (Entrepreneur)
- Has listed assets/deals on Studex
- Wants to market them on social media to attract investors
- Limited marketing expertise, needs automation

### Persona 2: Platform Marketer (Studex Admin)
- Promotes the Studex platform itself
- Needs consistent, high-volume content across channels
- Tracks ROI from marketing to user signups

### Persona 3: Verified Trader
- Has active deal pipeline on Studex
- Wants to build personal brand and attract deal flow
- Needs analytics to justify marketing spend

---

## 5. Feature Requirements

### 5.1 Onboarding & Configuration (Phase 1 — MVP)

#### 5.1.1 Marketing Profile Setup
- **Description:** Guided wizard to configure a user's marketing profile
- **Fields:**
  - Business/product name and description
  - Target audience demographic
  - Primary problem solved
  - Competitive differentiation
  - Category (finance, investment, real-estate, luxury-goods, tech, other)
  - App Store / website URL (if applicable)
  - Monetization model
- **Storage:** Firestore `marketing_profiles` collection
- **Priority:** P0

#### 5.1.2 Platform Connection (Upload-Post)
- **Description:** Connect Upload-Post account for multi-platform posting
- **Fields:**
  - Upload-Post API key
  - Profile username
  - Connected platforms selection (TikTok, Instagram, YouTube, LinkedIn, X, Threads, Pinterest, Reddit, Bluesky)
- **Validation:** API key verification via Upload-Post endpoint
- **Priority:** P0

#### 5.1.3 Image Generation Provider Setup
- **Description:** Configure AI image generation backend
- **Supported Providers:**
  - OpenAI (gpt-image-1.5 — recommended)
  - Stability AI (Stable Diffusion XL)
  - Replicate (open-source models)
  - Local image upload (no API)
- **Fields:** Provider selection, API key, model preference, base prompt template
- **Priority:** P0

#### 5.1.4 Account Warmup Guide
- **Description:** Interactive checklist for new TikTok account warmup (7-14 days)
- **Features:**
  - Daily task checklist (scroll, like, follow, comment)
  - Progress tracker (day X of 14)
  - Readiness signal detection tips
- **Priority:** P1

### 5.2 Competitor Research Engine (Phase 1)

#### 5.2.1 Competitor Analysis
- **Description:** Analyze 3-5 competitor accounts in user's niche
- **Data Captured:**
  - Hook types used in top-performing content
  - Slide format patterns (before/after, listicle, POV, tutorial)
  - View ranges (average vs. best-performing)
  - Posting frequency
  - CTA messaging patterns
  - Trending sounds in niche
- **Storage:** `competitor_research` collection per marketing profile
- **Output:** Gap analysis with actionable opportunities
- **Priority:** P1

### 5.3 Content Creation Pipeline (Phase 1 — MVP)

#### 5.3.1 Slideshow Generator
- **Description:** AI-powered 6-slide slideshow creation
- **Slide Structure:**
  1. Hook (attention-grabbing first slide)
  2. Problem (pain point identification)
  3. Discovery (introduce solution)
  4. Transformation 1 (show result)
  5. Transformation 2 (reinforce value)
  6. CTA (call-to-action with app/link reference)
- **Image Requirements:**
  - Portrait orientation: 1024x1536 (fills TikTok screen)
  - Consistent base elements across all 6 slides
  - iPhone photography style for authentic appearance
  - 3-9 minute generation time (async processing)
- **Priority:** P0

#### 5.3.2 Text Overlay Engine
- **Description:** Canvas-based text overlay system using node-canvas
- **Algorithm:**
  - Dynamic font sizing: ≤5 words = 75px, ≤12 words = 66px, 13+ = 51px
  - 15% outline width for readability on any background
  - Word-wrap to 75% image width
  - Vertical centering at 28% from top
  - Black outline + white fill rendering
- **Text Rules:**
  - 4-6 words per line, 3-4 lines per slide
  - Manual `\n` line breaks supported
  - No emoji (canvas limitation)
  - Reactions not labels ("Wait... is this nice??" not "Modern minimalist")
  - Safe zones: no text bottom 20% or top 10%
- **Priority:** P0

#### 5.3.3 Content Templates
- **Description:** Pre-built hook and caption templates by niche
- **Hook Categories:**
  - Person-conflict-AI (highest performing)
  - Budget transformation
  - Self-discovery/reveal
  - Before/after comparison
  - POV format
  - Listicle format
- **Caption Structure:** Hook → Problem → Discovery → What it does → Result → ≤5 hashtags
- **Priority:** P1

### 5.4 Multi-Platform Distribution (Phase 1 — MVP)

#### 5.4.1 Upload-Post Integration
- **Description:** Single-API multi-platform posting via Upload-Post
- **Endpoint:** `POST https://api.upload-post.com/api/upload_photos`
- **Features:**
  - Post to 10+ platforms in one API call
  - Async upload processing with `request_id` tracking
  - Automatic per-platform post URL tracking
  - Upload history and status monitoring
- **Supported Platforms:** TikTok, Instagram, YouTube, LinkedIn, X, Threads, Pinterest, Reddit, Bluesky
- **Priority:** P0

#### 5.4.2 Scheduling Engine
- **Description:** Automated posting schedule
- **Default Schedule:** 7:30 AM, 4:30 PM, 9:00 PM (user timezone)
- **Features:**
  - Configurable post times
  - Queue management (preview before posting)
  - Batch content preparation
  - Minimum 3x daily posting cadence
- **Priority:** P1

### 5.5 Analytics & Intelligence Loop (Phase 2)

#### 5.5.1 Platform Analytics Dashboard
- **Description:** Real-time analytics from Upload-Post API
- **Metrics:**
  - Followers count (per platform)
  - Impressions (total and per-post)
  - Reach (unique viewers)
  - Profile views
  - Time-series trend data
- **API:** `GET https://api.upload-post.com/api/analytics/{profile}`
- **Priority:** P0

#### 5.5.2 Upload History Tracking
- **Description:** Per-post performance tracking
- **API:** `GET https://api.upload-post.com/api/uploadposts/history`
- **Data:** Platform post IDs, URLs, timestamps, request IDs, success/failure status
- **Priority:** P0

#### 5.5.3 Conversion Tracking (RevenueCat)
- **Description:** Optional RevenueCat integration for revenue attribution
- **Capabilities:**
  - Connect impressions to paying users
  - Trial-to-paid conversion rates
  - Revenue per content piece attribution
  - Full funnel: Views → Profile Visits → Link Clicks → Download → Trial → Paid
- **Priority:** P2

#### 5.5.4 Daily Diagnostic Reports
- **Description:** Automated daily analytics report at 7:00 AM
- **Report Contents:**
  - 3-day rolling analytics window
  - Per-post performance breakdown
  - Hook performance ranking
  - CTA effectiveness comparison
  - Diagnostic classification (see 5.5.5)
  - Specific recommendations for that day's content
- **Storage:** `marketing_reports` collection
- **Priority:** P1

#### 5.5.5 Two-Axis Diagnostic Framework
- **Description:** Automated content performance classification
- **Matrix:**

| Scenario | Views | Conversions | Action |
|----------|-------|-------------|--------|
| **Scale** | High | High | Create 3 variations immediately |
| **Fix CTA** | High | Low | Test different CTAs, keep hooks |
| **Fix Hooks** | Low | High | Test new hook types, keep CTA |
| **Full Reset** | Low | Low | Complete format/audience change |
| **CTA Issue** | High views | Low downloads | Rotate CTA variations |
| **App Issue** | High downloads | Low paid | Pause posting, fix app experience |

- **Priority:** P1

### 5.6 Hook Performance Tracking (Phase 2)

#### 5.6.1 Hook A/B Testing
- **Description:** Track and compare hook performance over time
- **Data Model:**
  ```json
  {
    "requestId": "string",
    "hookText": "string",
    "hookCategory": "person-conflict|budget|self-discovery|listicle|pov",
    "date": "ISO date",
    "impressions": "number",
    "conversions": "number",
    "cta": "string",
    "platforms": ["tiktok", "instagram"]
  }
  ```
- **Decision Rules:**
  - Growing impressions (5K+/day) → DOUBLE DOWN (3 variations)
  - Steady (1K-5K/day) → Keep in rotation
  - Declining (<1K/day) → Try 1 more variation
  - Consistently low → DROP, try radically different approach
- **Priority:** P1

### 5.7 Frontend Dashboard (Phase 1 — MVP)

#### 5.7.1 Marketing Dashboard Page
- **Route:** `/dashboard/marketing`
- **Sections:**
  - Campaign overview cards (active campaigns, total posts, total reach)
  - Recent posts grid with platform status indicators
  - Quick-action buttons (Create Post, View Analytics, Run Report)
  - Performance trend chart (impressions over time)
- **Priority:** P0

#### 5.7.2 Content Creator Page
- **Route:** `/dashboard/marketing/create`
- **Features:**
  - Step-by-step slideshow creation wizard
  - AI prompt editor with live preview
  - Text overlay editor with drag positioning
  - Platform selection checkboxes
  - Caption editor with template suggestions
  - Preview carousel before posting
- **Priority:** P0

#### 5.7.3 Analytics Page
- **Route:** `/dashboard/marketing/analytics`
- **Features:**
  - Platform metrics cards (followers, impressions, reach)
  - Post performance table (sortable, filterable)
  - Hook performance leaderboard
  - CTA effectiveness comparison chart
  - Daily report viewer
  - Diagnostic matrix visualization
- **Priority:** P1

#### 5.7.4 Campaign Manager Page
- **Route:** `/dashboard/marketing/campaigns`
- **Features:**
  - Campaign list with status (active, paused, completed)
  - Content queue with scheduled posts
  - Competitor research results
  - Content template library
- **Priority:** P1

#### 5.7.5 Settings Page
- **Route:** `/dashboard/marketing/settings`
- **Features:**
  - Marketing profile editor
  - Upload-Post connection manager
  - Image generation provider config
  - Posting schedule configuration
  - RevenueCat integration toggle
  - Base prompt template editor
- **Priority:** P0

---

## 6. Technical Architecture

### 6.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Studex Frontend (Next.js)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Marketing │ │ Content  │ │Analytics │ │ Campaign │   │
│  │Dashboard │ │ Creator  │ │  Page    │ │ Manager  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       └─────────────┼───────────┼─────────────┘         │
│                     │           │                        │
│              ┌──────┴───────────┴──────┐                 │
│              │   Marketing API Client  │                 │
│              └────────────┬────────────┘                 │
└───────────────────────────┼──────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────┐
│              Firebase Backend (Cloud Functions)           │
│              ┌────────────┴────────────┐                 │
│              │  Marketing API Router   │                 │
│              └────────────┬────────────┘                 │
│  ┌────────┐ ┌─────────┐ ┌┴────────┐ ┌──────────┐       │
│  │Onboard │ │ Content │ │ Post    │ │Analytics │       │
│  │Service │ │ Gen Svc │ │ Service │ │ Service  │       │
│  └───┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘       │
│      │           │           │           │              │
│  ┌───┴───┐  ┌────┴────┐ ┌───┴──────┐ ┌──┴──────┐      │
│  │Firest.│  │OpenAI / │ │Upload-   │ │Upload-  │      │
│  │  DB   │  │Stability│ │Post API  │ │Post API │      │
│  └───────┘  └─────────┘ │(posting) │ │(analytics│      │
│                          └──────────┘ └─────────┘      │
└──────────────────────────────────────────────────────────┘
```

### 6.2 Data Model (Firestore Collections)

#### `marketing_profiles`
```json
{
  "userId": "string (FK to users)",
  "appName": "string",
  "description": "string",
  "audience": "string",
  "problem": "string",
  "differentiator": "string",
  "category": "string",
  "url": "string",
  "imageGen": {
    "provider": "openai|stability|replicate|local",
    "model": "string",
    "basePrompt": "string"
  },
  "uploadPost": {
    "profile": "string",
    "platforms": ["string"]
  },
  "posting": {
    "schedule": ["string"],
    "timezone": "string"
  },
  "revenuecat": {
    "enabled": "boolean",
    "projectId": "string"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `marketing_posts`
```json
{
  "profileId": "string (FK to marketing_profiles)",
  "userId": "string",
  "requestId": "string (Upload-Post reference)",
  "hookText": "string",
  "hookCategory": "string",
  "captionText": "string",
  "ctaText": "string",
  "slides": [
    {
      "imageUrl": "string (Firebase Storage)",
      "overlayText": "string",
      "prompt": "string"
    }
  ],
  "platforms": ["string"],
  "platformResults": {
    "tiktok": { "postId": "string", "url": "string", "status": "string" },
    "instagram": { "postId": "string", "url": "string", "status": "string" }
  },
  "status": "draft|queued|posting|posted|failed",
  "scheduledAt": "timestamp",
  "postedAt": "timestamp",
  "createdAt": "timestamp"
}
```

#### `marketing_analytics`
```json
{
  "profileId": "string",
  "date": "string (YYYY-MM-DD)",
  "platforms": {
    "tiktok": {
      "followers": "number",
      "impressions": "number",
      "reach": "number",
      "profileViews": "number"
    }
  },
  "posts": [
    {
      "postId": "string (FK to marketing_posts)",
      "requestId": "string",
      "impressions": "number",
      "conversions": "number",
      "diagnostic": "scale|fix-cta|fix-hooks|full-reset"
    }
  ],
  "createdAt": "timestamp"
}
```

#### `marketing_reports`
```json
{
  "profileId": "string",
  "date": "string",
  "period": { "start": "string", "end": "string" },
  "summary": "string (markdown)",
  "topHooks": ["object"],
  "ctaPerformance": ["object"],
  "diagnosticBreakdown": {
    "scale": "number",
    "fixCta": "number",
    "fixHooks": "number",
    "fullReset": "number"
  },
  "recommendations": ["string"],
  "createdAt": "timestamp"
}
```

#### `hook_performance`
```json
{
  "profileId": "string",
  "hookText": "string",
  "hookCategory": "string",
  "requestId": "string",
  "date": "string",
  "impressions": "number",
  "conversions": "number",
  "ctaText": "string",
  "status": "doubleDown|testing|rotation|dropped",
  "updatedAt": "timestamp"
}
```

### 6.3 API Endpoints (New Cloud Functions)

```
# Marketing Profile
POST   /api/marketing/profile              # Create/update marketing profile
GET    /api/marketing/profile              # Get user's marketing profile

# Content Creation
POST   /api/marketing/slides/generate      # Generate slideshow images (async)
POST   /api/marketing/slides/overlay       # Apply text overlays
GET    /api/marketing/slides/:postId       # Get slide images

# Posting
POST   /api/marketing/post                 # Post to platforms via Upload-Post
GET    /api/marketing/post/:requestId      # Check post status
GET    /api/marketing/posts                # List user's posts

# Analytics
GET    /api/marketing/analytics            # Get platform analytics
GET    /api/marketing/analytics/history    # Get upload history
POST   /api/marketing/analytics/report     # Generate daily report
GET    /api/marketing/analytics/reports    # List reports

# Hook Performance
GET    /api/marketing/hooks                # Get hook performance data
POST   /api/marketing/hooks/track          # Log hook performance

# Competitor Research
POST   /api/marketing/research             # Start competitor research
GET    /api/marketing/research             # Get research results
```

### 6.4 External API Integrations

| Service | Purpose | Auth Method |
|---------|---------|-------------|
| Upload-Post API | Multi-platform posting + analytics | API Key (header) |
| OpenAI API | Image generation (gpt-image-1.5) | API Key (Bearer) |
| Stability AI | Alternative image generation | API Key |
| Replicate | Alternative image generation | API Token |
| RevenueCat V2 | Conversion tracking | Secret Key (sk_) |

### 6.5 Technology Stack Additions

| Component | Technology | Reason |
|-----------|-----------|--------|
| Text Overlays | node-canvas | Server-side image text rendering |
| Image Processing | Sharp | Image resizing and optimization |
| Job Queue | Cloud Tasks / Pub/Sub | Async image generation & posting |
| Scheduled Jobs | Cloud Scheduler | Daily report generation at 7 AM |
| File Storage | Firebase Storage | Slide images and generated content |

---

## 7. Implementation Phases

### Phase 1 — MVP (Weeks 1-3)
- [ ] Marketing profile setup wizard
- [ ] Image generation integration (OpenAI)
- [ ] Text overlay engine (node-canvas)
- [ ] Upload-Post posting integration
- [ ] Marketing dashboard page
- [ ] Content creator page with preview
- [ ] Basic analytics display
- [ ] Settings page for configuration

### Phase 2 — Intelligence Loop (Weeks 4-6)
- [ ] Daily diagnostic report system
- [ ] Hook performance tracking
- [ ] Two-axis diagnostic framework
- [ ] Analytics dashboard with charts
- [ ] CTA effectiveness comparison
- [ ] Content queue and scheduling
- [ ] Campaign manager

### Phase 3 — Advanced Features (Weeks 7-9)
- [ ] Competitor research engine
- [ ] RevenueCat conversion tracking
- [ ] Content template library
- [ ] Batch API for cost savings
- [ ] Hook A/B testing automation
- [ ] AI-powered content recommendations
- [ ] Account warmup guide

### Phase 4 — Scale & Optimize (Weeks 10-12)
- [ ] Multi-user campaign management
- [ ] Team collaboration features
- [ ] Advanced reporting and exports
- [ ] Webhook notifications
- [ ] API rate limiting and quotas
- [ ] Admin dashboard for platform marketing

---

## 8. Security & Compliance

### API Key Management
- All third-party API keys stored as encrypted Firestore fields
- Server-side only — never exposed to frontend
- Upload-Post API key validated on save
- Key rotation support

### Access Control
- Marketing features require authenticated user
- Profile data scoped to user (Firestore rules)
- Admin can view aggregate analytics
- API endpoints require Firebase JWT

### Data Privacy
- User marketing data is private by default
- No cross-user data sharing without consent
- Generated images stored in user-scoped Storage paths
- Analytics data retention: 90 days (configurable)

---

## 9. Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| Image generation latency | < 9 minutes for 6 slides |
| Text overlay processing | < 5 seconds per slide |
| Post submission latency | < 3 seconds (async) |
| Analytics refresh rate | Every 15 minutes |
| Dashboard load time | < 2 seconds |
| Uptime | 99.5% |
| Concurrent users | 100+ |
| Storage per user | 500MB (images) |

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Upload-Post API downtime | Posts fail | Queue with retry logic, notify user |
| OpenAI rate limits | Image gen delays | Support multiple providers, batch API |
| TikTok algorithm changes | Reduced reach | Data-driven iteration, multi-platform |
| API key exposure | Security breach | Server-side only, encrypted storage |
| High image storage costs | Budget overrun | Auto-cleanup old drafts, compression |
| Canvas rendering issues | Text overlay fails | Fallback to CSS-based overlays |

---

## 11. Appendix

### A. Larry's Proven Hook Formulas
1. **Person-Conflict-AI:** "I showed my [person] what AI thinks our [space] should look like"
2. **Budget Transformation:** "IKEA budget, designer taste — AI made it happen"
3. **Self-Discovery:** "I asked AI to show me [transformation]... I wasn't ready"
4. **Before/After:** "Same room. Same budget. AI just hits different"
5. **POV:** "POV: You find an app that actually [solves problem]"

### B. Caption Template
```
[Hook - emotional or conflict-driven opening]

[Problem - relatable pain point]

[Discovery - how they found the solution]

[What it does - brief feature highlight]

[Result - emotional payoff]

#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
```

### C. Upload-Post API Quick Reference
- **Post photos:** `POST /api/upload_photos` (multipart/form-data)
- **Platform analytics:** `GET /api/analytics/{profile}?platforms=tiktok,instagram`
- **Upload history:** `GET /api/uploadposts/history?profile_username={profile}`
- **Upload status:** `GET /api/uploadposts/status?request_id={id}`

---

*This PRD is a living document. Updates will be tracked in version control.*
