# Claudeskills — Studex Global Markets Skill Registry

**Version:** 1.0.0
**Last Updated:** 2026-03-25
**Maintainer:** Studex Global Markets Engineering

---

> This document serves as the central registry for all Claude-powered skills in the Studex Global Markets platform.
> Use this file to track, update, and port skills across machines and environments.

---

## Table of Contents

1. [Marketing Skill App](#1-marketing-skill-app)
2. [Google Stitch Skill](#2-google-stitch-skill)
3. [Authentication & User Management Skill](#3-authentication--user-management-skill)
4. [Deal Pipeline Skill](#4-deal-pipeline-skill)
5. [Real-Time Messaging Skill](#5-real-time-messaging-skill)
6. [KYC Verification Skill](#6-kyc-verification-skill)
7. [Analytics & Reporting Skill](#7-analytics--reporting-skill)
8. [Content Generation Skill](#8-content-generation-skill)
9. [Competitor Research Skill](#9-competitor-research-skill)
10. [Hook Performance Skill](#10-hook-performance-skill)
11. [Multi-Platform Distribution Skill](#11-multi-platform-distribution-skill)
12. [BMAD Consulting Skill](#12-bmad-consulting-skill)

---

## 1. Marketing Skill App

**Status:** Implemented
**PRD:** [PRD-MARKETING-SKILL-APP.md](./PRD-MARKETING-SKILL-APP.md)
**Category:** AI-Powered Marketing Automation

### Overview
AI-powered automated marketing pipeline integrating the Upload-Post Larry Marketing Skill methodology. Handles TikTok/Instagram slideshow creation, multi-platform distribution, analytics tracking, and data-driven content optimization.

### Capabilities
- **Slideshow Generation** — AI-generated 6-slide portrait slideshows (1024x1536)
- **Text Overlay Engine** — Canvas-based text rendering with dynamic sizing
- **Multi-Platform Posting** — Single-API distribution to 10+ platforms via Upload-Post
- **Analytics Loop** — Daily diagnostic reports with two-axis performance framework
- **Hook A/B Testing** — Track and optimize hook performance over time
- **Content Templates** — Pre-built hooks and captions by niche category

### Tech Stack
- Frontend: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- Backend: Firebase Cloud Functions + Firestore
- External APIs: Upload-Post, OpenAI (image gen), Stability AI, Replicate

### Routes
| Route | Purpose |
|-------|---------|
| `/marketing` | Main dashboard |
| `/marketing/create` | Content creator wizard |
| `/marketing/campaigns` | Campaign manager |
| `/marketing/analytics` | Analytics dashboard |
| `/marketing/settings` | Profile & API config |

### API Endpoints
```
POST   /api/marketing/profile           — Create/update profile
GET    /api/marketing/profile/:userId   — Get profile
POST   /api/marketing/posts             — Create post
GET    /api/marketing/posts/:profileId  — List posts
POST   /api/marketing/posts/:postId/status — Update status
POST   /api/marketing/analytics         — Save analytics
POST   /api/marketing/reports/generate  — Generate report
POST   /api/marketing/hooks/track       — Track hook performance
```

### Environment Variables
```
UPLOAD_POST_API_KEY       — Upload-Post API key (per-user, stored in Firestore)
OPENAI_API_KEY            — Image generation
STABILITY_API_KEY         — Alt image generation
REPLICATE_API_TOKEN       — Alt image generation
REVENUECAT_SECRET_KEY     — Conversion tracking (optional)
```

---

## 2. Google Stitch Skill

**Status:** New — Implementing
**Category:** Data Integration & Pipeline Orchestration

### Overview
Google Stitch provides data pipeline orchestration, enabling Studex to stitch together data from multiple sources (analytics platforms, CRMs, marketing tools, financial data feeds) into a unified data layer. This skill connects Studex to Google's data infrastructure for ETL workflows, real-time data sync, and cross-platform data unification.

### Capabilities
- **Data Source Connections** — Connect to 100+ data sources (social media analytics, payment processors, CRMs)
- **ETL Pipelines** — Extract, transform, and load data between platforms
- **Real-Time Sync** — Keep data synchronized across Studex services
- **Data Transformation** — Clean, normalize, and enrich data in transit
- **Scheduled Pipelines** — Automated data pulls on configurable schedules
- **Data Warehouse Integration** — Feed transformed data into BigQuery or Firestore

### Use Cases for Studex
1. **Marketing Analytics Aggregation** — Pull analytics from TikTok, Instagram, YouTube into unified dashboard
2. **Deal Pipeline Data Enrichment** — Enrich deal data with external market data
3. **Financial Data Sync** — Sync trading/investment data from external platforms
4. **User Behavior Tracking** — Aggregate user activity across all Studex touchpoints
5. **Cross-Platform Reporting** — Unified reporting from all connected services

### Configuration
```
# Environment variable (DO NOT hardcode in source files)
GOOGLE_STITCH_API_KEY=<stored securely in environment>

# Firebase Functions environment config
firebase functions:config:set stitch.api_key="YOUR_KEY_HERE"
```

### API Integration
```typescript
// Service: lib/stitch-api.ts
export const stitchApi = {
  pipelines: {
    create(config: StitchPipelineConfig): Promise<Pipeline>
    list(): Promise<Pipeline[]>
    run(pipelineId: string): Promise<PipelineRun>
    getStatus(runId: string): Promise<PipelineStatus>
    delete(pipelineId: string): Promise<void>
  },
  sources: {
    connect(source: DataSourceConfig): Promise<DataSource>
    list(): Promise<DataSource[]>
    test(sourceId: string): Promise<ConnectionTest>
    disconnect(sourceId: string): Promise<void>
  },
  transforms: {
    create(transform: TransformConfig): Promise<Transform>
    preview(transform: TransformConfig, sampleData: any[]): Promise<any[]>
  },
  destinations: {
    configure(dest: DestinationConfig): Promise<Destination>
    list(): Promise<Destination[]>
  },
  sync: {
    trigger(pipelineId: string): Promise<SyncResult>
    schedule(pipelineId: string, cron: string): Promise<Schedule>
    getHistory(pipelineId: string): Promise<SyncHistory[]>
  }
}
```

### Firestore Collections
```
stitch_pipelines     — Pipeline configurations
stitch_sources       — Connected data sources
stitch_runs          — Pipeline execution history
stitch_schedules     — Scheduled pipeline runs
stitch_transforms    — Data transformation rules
```

### Routes
| Route | Purpose |
|-------|---------|
| `/dashboard/stitch` | Pipeline overview dashboard |
| `/dashboard/stitch/pipelines` | Pipeline manager |
| `/dashboard/stitch/sources` | Data source connections |
| `/dashboard/stitch/transforms` | Transform editor |
| `/dashboard/stitch/history` | Run history & logs |

### Cloud Function Endpoints
```
POST   /api/stitch/pipelines            — Create pipeline
GET    /api/stitch/pipelines            — List pipelines
POST   /api/stitch/pipelines/:id/run    — Trigger pipeline run
GET    /api/stitch/pipelines/:id/status — Get run status
DELETE /api/stitch/pipelines/:id        — Delete pipeline
POST   /api/stitch/sources              — Connect data source
GET    /api/stitch/sources              — List sources
POST   /api/stitch/sources/:id/test     — Test connection
POST   /api/stitch/transforms           — Create transform
POST   /api/stitch/sync/:id             — Trigger sync
POST   /api/stitch/sync/:id/schedule    — Set schedule
GET    /api/stitch/sync/:id/history     — Get sync history
```

---

## 3. Authentication & User Management Skill

**Status:** Implemented
**Category:** Core Platform

### Overview
Firebase-based authentication with email/password and Google OAuth. Handles user profiles, role assignment, and protected route management.

### Capabilities
- Email/Password signup & login
- Google OAuth integration
- Custom role assignment (investor, entrepreneur, admin)
- Protected route enforcement via AuthProvider
- Profile CRUD with Firestore

### Key Files
```
studex-frontend/lib/auth.ts
studex-frontend/components/providers/AuthProvider.tsx
firebase-backend/functions/src/index.ts (onUserCreate, onUserDelete)
```

---

## 4. Deal Pipeline Skill

**Status:** Implemented
**Category:** Core Platform

### Overview
Full deal lifecycle management — creation, pipeline tracking, participant management, and status updates with real-time Firestore snapshots.

### Capabilities
- Deal CRUD operations
- Pipeline stage tracking (prospect > negotiation > due-diligence > closed)
- Multi-participant access control
- Real-time deal updates via Firestore snapshots
- Status management (active, paused, completed, cancelled)

### API Endpoints
```
POST /api/deals/create
POST /api/deals/:id/update-status
```

### Key Files
```
studex-frontend/lib/api.ts (dealsApi)
firebase-backend/functions/src/index.ts
```

---

## 5. Real-Time Messaging Skill

**Status:** Implemented
**Category:** Core Platform

### Overview
Real-time direct messaging between platform users using Firestore subcollections with live snapshot listeners.

### Capabilities
- 1-to-1 and group conversations
- Real-time message delivery via Firestore snapshots
- Conversation list with last-message preview
- Message read/unread tracking

### Key Files
```
studex-frontend/lib/api.ts (messagesApi)
studex-frontend/app/messages/page.tsx
```

---

## 6. KYC Verification Skill

**Status:** Implemented
**Category:** Compliance & Trust

### Overview
Know Your Customer document submission and admin verification workflow with custom Firebase claims for verified traders.

### Capabilities
- Document upload (ID, proof of address, etc.)
- Admin review and approval workflow
- Custom claims assignment (verified_trader)
- Document status tracking

### API Endpoints
```
POST /api/kyc/submit
POST /api/kyc/:id/verify
```

---

## 7. Analytics & Reporting Skill

**Status:** Implemented
**Category:** Marketing Intelligence

### Overview
Real-time analytics from Upload-Post API with daily diagnostic reports and performance classification using the two-axis framework.

### Capabilities
- Platform metrics (followers, impressions, reach, profile views)
- Upload history tracking with per-post performance
- Daily automated reports at 7:00 AM
- Two-axis diagnostic framework (views x conversions matrix)
- 3-day rolling analytics window

### Diagnostic Matrix
| Views | Conversions | Action |
|-------|-------------|--------|
| High | High | Scale — create 3 variations |
| High | Low | Fix CTA — test different CTAs |
| Low | High | Fix Hooks — test new hooks |
| Low | Low | Full Reset — change format/audience |

---

## 8. Content Generation Skill

**Status:** Implemented
**Category:** AI Content Creation

### Overview
AI-powered slideshow and content generation with text overlay engine for social media marketing.

### Capabilities
- 6-slide portrait slideshow generation (1024x1536)
- Multi-provider image generation (OpenAI, Stability, Replicate)
- Canvas-based text overlay with dynamic font sizing
- Content template library (hooks, captions, CTAs)
- Safe zone enforcement (no text bottom 20% or top 10%)

### Text Overlay Algorithm
```
Words ≤ 5  → 75px font
Words ≤ 12 → 66px font
Words 13+  → 51px font
Outline: 15% width
Wrap: 75% image width
Position: 28% from top (vertical center)
```

---

## 9. Competitor Research Skill

**Status:** Planned (Phase 3)
**Category:** Marketing Intelligence

### Overview
Automated competitor analysis engine that analyzes 3-5 competitor accounts in the user's niche.

### Capabilities
- Hook type analysis from top-performing content
- Slide format pattern recognition
- View range benchmarking
- Posting frequency analysis
- CTA messaging pattern detection
- Trending sound identification
- Gap analysis with actionable opportunities

### Firestore Collection
```
competitor_research — Per-profile research results
```

---

## 10. Hook Performance Skill

**Status:** Implemented
**Category:** Marketing Optimization

### Overview
Track and A/B test hook performance to optimize content engagement over time.

### Capabilities
- Hook categorization (person-conflict, budget, self-discovery, before-after, POV, listicle)
- Impression and conversion tracking per hook
- Performance-based decision rules:
  - 5K+/day impressions → DOUBLE DOWN (3 variations)
  - 1K-5K/day → Keep in rotation
  - <1K/day → Try 1 more variation
  - Consistently low → DROP

### Data Model
```json
{
  "hookText": "string",
  "hookCategory": "person-conflict|budget|self-discovery|...",
  "impressions": "number",
  "conversions": "number",
  "status": "doubleDown|testing|rotation|dropped"
}
```

---

## 11. Multi-Platform Distribution Skill

**Status:** Implemented
**Category:** Content Distribution

### Overview
Single-API multi-platform content distribution via Upload-Post integration.

### Supported Platforms
TikTok, Instagram, YouTube, LinkedIn, X (Twitter), Threads, Pinterest, Reddit, Bluesky

### Capabilities
- Post to 10+ platforms in one API call
- Async upload processing with request ID tracking
- Per-platform post URL tracking
- Upload history and status monitoring
- Configurable posting schedule (default: 7:30 AM, 4:30 PM, 9:00 PM)

### Upload-Post API Reference
```
POST /api/upload_photos           — Post photos/slideshows
GET  /api/analytics/{profile}     — Platform analytics
GET  /api/uploadposts/history     — Upload history
GET  /api/uploadposts/status      — Upload status check
```

---

## 12. BMAD Consulting Skill

**Status:** Implemented
**Category:** Development Methodology & Project Planning
**Framework:** [BMAD-FRAMEWORK.md](./docs/bmad/BMAD-FRAMEWORK.md)

### Overview
Structured consulting methodology that runs BEFORE any code is written. Combines three
frameworks into a systematic build pipeline: **Ralph Wiggum Loop** (naive discovery questioning),
**BMAD** (structured brief generation), and **Get Shit Done** (disciplined execution).

### When It Triggers
- **Explicitly** — When the user invokes a BMAD session
- **Auto-triggered** — When Claude detects a new feature, project, or skill with unclear
  scope, undefined requirements, or that would benefit from structured planning

### The Three Phases
1. **Ralph Wiggum Loop** — Ask 10+ "naive" questions until zero unknowns remain.
   Vague answers trigger follow-up questions. The loop only exits when everything is clear.
2. **BMAD Brief** — Structure all answers into an actionable brief covering: problem,
   users, features, agents, architecture, data model, risks, phases, and success metrics.
3. **GSD Execution** — Build exactly what the brief says. No scope creep. Commit after
   each unit. Update Claudeskills.md when done.

### Core Questions (10 Minimum)
| # | Block | Question |
|---|-------|----------|
| 1 | Business | What problem are we solving? |
| 2 | Business | Who is this for? |
| 3 | Business | What does success look like? |
| 4 | Model | How does this create value? |
| 5 | Model | What already exists? |
| 6 | Architecture | What is the technical scope? |
| 7 | Architecture | What agents are involved? |
| 8 | Architecture | What are the data requirements? |
| 9 | Development | What are the constraints and risks? |
| 10 | Development | What is the implementation order? |

Bonus questions (11-15) are asked when answers are vague or reveal new unknowns.

### Agent Considerations (Built Into Q7)
- Which AI agents or automated systems execute tasks?
- What is the orchestration flow between agents?
- What decisions require human-in-the-loop vs. full automation?
- What data do agents need access to?

### Output
- **Brief** saved to `docs/bmad/[project-name]-brief.md`
- **Option** for deeper PRD-level analysis if needed
- **Auto-updates** Claudeskills.md with new skill entry

### Existing Briefs
| Brief | Status | Link |
|-------|--------|------|
| Marketing Skill App | Implemented | [marketing-skill-brief.md](./docs/bmad/marketing-skill-brief.md) |
| Google Stitch Skill | Implemented | [stitch-skill-brief.md](./docs/bmad/stitch-skill-brief.md) |

### Key Files
```
docs/bmad/BMAD-FRAMEWORK.md     — Full framework reference & templates
docs/bmad/*-brief.md            — Individual project briefs
Claudeskills.md                 — Updated after each BMAD → GSD cycle
```

---

## Quick Setup Guide

### Porting Skills to a New Machine

1. **Clone the repo:**
   ```bash
   git clone https://github.com/TumeloRamaphosa/Stud-Ex-Global-Markets-.git
   cd Stud-Ex-Global-Markets-
   ```

2. **Set environment variables:**
   ```bash
   # Create .env.local in studex-frontend/
   cp studex-frontend/.env.example studex-frontend/.env.local
   # Fill in Firebase config values

   # Set Cloud Functions secrets
   firebase functions:config:set \
     stitch.api_key="YOUR_GOOGLE_STITCH_KEY" \
     openai.api_key="YOUR_OPENAI_KEY"
   ```

3. **Install dependencies:**
   ```bash
   cd studex-frontend && npm install
   cd ../firebase-backend/functions && npm install
   ```

4. **Run locally:**
   ```bash
   # Terminal 1 — Backend emulators
   cd firebase-backend && firebase emulators:start

   # Terminal 2 — Frontend
   cd studex-frontend && npm run dev
   ```

5. **Read this file** to understand all available skills and their status.

---

## Skill Status Legend

| Status | Meaning |
|--------|---------|
| Implemented | Fully built and deployed |
| New — Implementing | Currently being built |
| Planned | Designed but not yet built |
| Deprecated | No longer maintained |

---

## Adding New Skills

When adding a new skill to this registry:

1. Add a new section following the template above
2. Include: Status, Category, Overview, Capabilities, Tech details
3. Document API endpoints, routes, and environment variables
4. Update the Table of Contents
5. Commit and push to keep all machines in sync

---

*This is a living document. All skill updates should be tracked here and pushed to GitHub for cross-machine portability.*
