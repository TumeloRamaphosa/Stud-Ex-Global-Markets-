# Product Requirements Document (PRD)
# AI-Powered Autonomous Development Platform — OpenClaw + Google AntiGravity Integration

**Version:** 1.0.0
**Date:** 2026-04-01
**Status:** Draft
**Author:** Studex Global Markets Engineering
**Source:** YouTube Video — *"I replaced OpenClaw with AntiGravity... its WILD"* by Jack Roberts (@Itssssss_Jack)
**Video URL:** https://www.youtube.com/watch?v=C4fTWiOGXpM

---

## 1. Executive Summary

This PRD captures the key insights, frameworks, and workflows from Jack Roberts' demonstration of replacing OpenClaw with Google AntiGravity as the primary AI-powered development environment. The video reveals how combining these tools creates a **fully autonomous engineering pipeline** — from planning to deployment — using natural language prompts, specialized AI agents, and structured development frameworks.

The core thesis: by replacing OpenClaw's self-hosted agent runtime with Google AntiGravity's managed IDE, developers gain access to premium AI models (Claude Opus 4.6, Gemini 3.1 Pro), structured project management, and a robust deployment pipeline — all while reducing operational overhead and cost.

This document translates these findings into actionable product requirements for the Studex Global Markets platform.

---

## 2. Problem Statement

### Current Pain Points
1. **Fragmented AI tooling** — Developers juggle multiple AI agents, IDEs, and deployment tools with no unified workflow
2. **Context rot in long sessions** — AI performance degrades as conversations grow, leading to repeated errors and wasted tokens
3. **Unstructured development** — Without a systematic framework, AI-assisted projects lack consistency and quality assurance
4. **High token costs** — Inefficient model usage and bloated context windows drive up operational costs
5. **Manual deployment friction** — Moving from code to production requires multiple manual steps across platforms
6. **OpenClaw IP bans** — Google has been banning accounts using OpenClaw with AntiGravity OAuth, creating reliability concerns for production workflows

### Opportunity
By adopting the **B.L.A.S.T. framework** and AntiGravity's managed platform, Studex can build an autonomous development pipeline that handles: **plan → scaffold → build → style → deploy** — with built-in quality assurance and cost optimization.

---

## 3. Key Concepts from Video

### 3.1 The OpenClaw to AntiGravity Migration

| Aspect | OpenClaw (Before) | AntiGravity (After) |
|--------|-------------------|---------------------|
| **Hosting** | Self-hosted agent runtime | Google-managed IDE |
| **Model Access** | Requires proxy configuration | Native access to Claude 4.6, Gemini 3.1 |
| **Cost** | Free but requires infrastructure | Free tier available; paid tiers for scale |
| **Reliability** | IP bans from cloud providers | Official Google OAuth integration |
| **Deployment** | Manual pipeline setup | Built-in Vercel/cloud deployment |
| **Agents** | Custom agent configuration | Pre-built specialized agents (UX, debugger, reviewer) |
| **Skills** | Community plugins via Claw Hub | AntiGravity Skills folder + MCP integrations |

### 3.2 The B.L.A.S.T. Master System Framework

A five-phase structured development methodology created by Jack Roberts:

#### **B — Blueprint Phase**
- Define the single desired outcome for the project
- Identify required integrations and data sources
- List product deliverables
- Establish governing rules and constraints
- Generates **Protocol Zero**: task plan, findings tracker, and core project file (`gemini.mmd`)

#### **L — Links Phase**
- Establish connections to external services (Supabase, ClickUp, APIs)
- Verify all integrations function before writing any code
- Configure MCP (Model Context Protocol) servers for tool access
- Set up Zapier bridges for cross-platform automation

#### **A — Architectural Layer**
- Construct the Minimum Viable Product (MVP)
- Build the simplest functional version addressing core requirements
- Focus on working functionality before aesthetics
- Single-task messaging: one clear instruction per message for best quality

#### **S — Stylization Layer**
- Refine UI/UX to match visual specifications
- Apply brand colors, typography, and design system rules
- Use screenshot feedback for precise visual iteration
- Import components from CodePen or extracted HTML/CSS from reference sites
- Build 80% of designs in Google AI Studio, then import for functional refinement

#### **T — Trigger Phase**
- Configure deployment rules for cloud environments
- Set up Vercel deployment via API tokens
- Configure scheduled tasks and background automation
- Establish cron jobs for autonomous execution

---

## 4. Goals & Success Metrics

### Primary Goals
| Goal | Metric | Target |
|------|--------|--------|
| Autonomous development pipeline | Features shipped via AI agents per sprint | 10+ |
| Reduce development time | Time from requirements to deployed MVP | < 2 hours |
| Cost optimization | Token spend per project | 50% reduction vs unstructured approach |
| Quality assurance | Automated QA checks per deployment | 100% coverage (SEO, a11y, contrast) |
| Deployment automation | Manual steps from code to production | 0 (fully automated) |

### Secondary Goals
- Eliminate context rot through structured conversation management
- Build reusable Skills library for Studex-specific patterns
- Enable non-technical team members to ship features via natural language
- Create standardized project templates for common Studex use cases

---

## 5. Functional Requirements

### 5.1 Project Initialization & Organization

| ID | Requirement | Priority |
|----|-------------|----------|
| F-001 | One URL = one project folder enforcement | P0 |
| F-002 | Automatic Skills folder import on project creation | P0 |
| F-003 | Global rules configuration (coding style, brand, naming) | P0 |
| F-004 | Protocol Zero generation (task plan, tracker, project file) | P1 |
| F-005 | Template library for Studex deal categories | P1 |

### 5.2 B.L.A.S.T. Framework Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| F-010 | Blueprint phase wizard with outcome/integration/rules definition | P0 |
| F-011 | Links phase with automated integration verification | P0 |
| F-012 | Architecture phase with MVP scaffolding from natural language | P0 |
| F-013 | Stylization phase with visual diff and screenshot feedback | P1 |
| F-014 | Trigger phase with one-click deployment configuration | P1 |
| F-015 | Phase transition gates requiring completion before progression | P2 |

### 5.3 AI Agent Orchestration

| ID | Requirement | Priority |
|----|-------------|----------|
| F-020 | Specialized agent roles: UX designer, debugger, builder, code reviewer | P0 |
| F-021 | Single-task message routing for optimal output quality | P1 |
| F-022 | Context rot detection with automatic conversation summarization | P1 |
| F-023 | Loop-breaking strategy: force AI to articulate new approach before retry | P1 |
| F-024 | Model selection routing (Opus for complex reasoning, lighter models for routine) | P2 |

### 5.4 External Integrations

| ID | Requirement | Priority |
|----|-------------|----------|
| F-030 | MCP (Model Context Protocol) server management | P0 |
| F-031 | Supabase integration for database operations | P0 |
| F-032 | Vercel deployment via API token | P1 |
| F-033 | Zapier bridge for cross-platform automation (Gmail, Slack, CRM) | P1 |
| F-034 | WhatsApp/Telegram/Discord task automation | P2 |
| F-035 | ClickUp project management sync | P2 |

### 5.5 Quality Assurance

| ID | Requirement | Priority |
|----|-------------|----------|
| F-040 | Automated SEO optimization checks | P1 |
| F-041 | Accessibility compliance validation | P1 |
| F-042 | Color contrast ratio verification | P1 |
| F-043 | Semantic markup validation | P1 |
| F-044 | Post-deployment QA checklist generation with pass/fail status | P2 |

---

## 6. Non-Functional Requirements

### 6.1 Performance
- AI agent response time: < 30 seconds for standard operations
- Deployment pipeline: < 5 minutes from commit to live
- MCP server count: keep active servers under 50 to maintain performance

### 6.2 Cost Efficiency
- Core project files (`claude.md`, `gemini.md`) kept under 100 lines to minimize token consumption
- Fast Mode for routine follow-ups; Planning Mode reserved for complex initial tasks
- Unused MCP servers auto-disabled to reduce context window overhead
- Model routing: premium models for reasoning, free/cheap models for repetitive tasks

### 6.3 Reliability
- Graceful fallback if primary AI model is unavailable
- Conversation state preservation across session boundaries
- Automatic handover note generation for session continuity

### 6.4 Security
- OAuth-based authentication (avoid token-sharing patterns that triggered Google bans)
- API key rotation and secure storage
- No plaintext credentials in project files

---

## 7. Technical Architecture

```
+------------------------------------------+
|          Studex Platform Layer            |
|  (Deal management, user profiles, etc.)  |
+------------------------------------------+
                    |
+------------------------------------------+
|      B.L.A.S.T. Orchestration Engine     |
|  Blueprint → Links → Arch → Style → Trig |
+------------------------------------------+
          |              |              |
+---------+--+  +--------+---+  +------+------+
| AI Agents  |  | MCP Server |  | Deployment  |
| (Opus 4.6, |  | Hub        |  | Pipeline    |
|  Gemini 3) |  | (Tools,    |  | (Vercel,    |
|            |  |  Zapier)   |  |  Cloud)     |
+------------+  +------------+  +-------------+
          |              |              |
+---------+--------------+--------------+------+
|              External Services               |
| Supabase | ClickUp | Slack | Discord | APIs  |
+----------------------------------------------+
```

---

## 8. Cost Optimization Strategies (from Video)

| Strategy | Implementation | Expected Savings |
|----------|---------------|-----------------|
| File size optimization | Keep gemini.md/claude.md under 100 lines | 3-7x cost reduction vs 700-line files |
| Model routing | Opus for planning, Haiku/Flash for routine tasks | 40-60% token savings |
| Fast Mode usage | Toggle for minor edits and follow-ups | 20-30% per routine interaction |
| MCP pruning | Disable unused servers, cap at 50 active | 15-25% context overhead reduction |
| Open Code access | Free/cheaper models for repetitive work | Variable, up to 80% for routine tasks |

---

## 9. Active Development Best Practices (from Video)

### Context Rot Management
When AI performance degrades in long sessions:
> "Summarize succinctly this conversation, problems, and next steps"
Use this summary as a handover note when starting fresh conversations.

### Single-Task Messaging
Send **one clear instruction per message** — produces measurably faster, higher-quality output than stacking multiple requests.

### Loop-Breaking Strategy
When AI repeats failed approaches, demand it **articulate its new strategy before attempting another fix**. This forces genuinely different approaches.

### Visual Design Workflow
1. Build ~80% of designs in **Google AI Studio**
2. Import the zip file into AntiGravity
3. Use functional refinement for production scaling
4. Use **screenshot feedback** (Cmd+Shift+5) for precise visual iteration

### Component Sourcing
- Extract HTML/CSS from public sites using HTML extractor tools
- Search **CodePen** for ready-made components (buttons, charts, pricing tables)
- Request AI to adapt components to match project specifications

---

## 10. Migration Path: OpenClaw → AntiGravity

### Phase 1: Setup (Day 1)
- [ ] Install Google AntiGravity IDE
- [ ] Install Claude Code extension
- [ ] Create AntiGravity Skills folder with Studex templates
- [ ] Configure global rules (brand, coding standards)

### Phase 2: Framework Adoption (Week 1)
- [ ] Implement B.L.A.S.T. system prompt for all new projects
- [ ] Configure MCP servers for Studex integrations (Supabase, Vercel)
- [ ] Set up Zapier automations for cross-platform workflows
- [ ] Migrate existing OpenClaw skills to AntiGravity format

### Phase 3: Optimization (Week 2-3)
- [ ] Tune model routing for cost optimization
- [ ] Build Studex-specific QA skill (Vyux Promax equivalent)
- [ ] Create project templates for common deal types
- [ ] Establish conversation management protocols

### Phase 4: Automation (Week 4+)
- [ ] Configure cron jobs for automated tasks
- [ ] Set up platform automation (WhatsApp, Telegram, Discord)
- [ ] Deploy Modle Cloud for background processing
- [ ] Monitor and optimize token spend

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Google account bans for OpenClaw usage | High | Critical | Migrate fully to AntiGravity; avoid third-party OAuth proxies |
| Token cost overruns | Medium | High | Implement model routing + file size caps + MCP pruning |
| Context rot causing code quality issues | Medium | Medium | Enforce single-task messaging + conversation summarization |
| AntiGravity platform changes/pricing | Low | High | Maintain abstraction layer; keep OpenClaw as fallback |
| MCP server security vulnerabilities | Low | High | Verify GitHub repos before installing; limit permissions |

---

## 12. Success Criteria

### MVP (4 weeks)
- [ ] B.L.A.S.T. framework operational for new Studex features
- [ ] 3+ specialized AI agents configured and functional
- [ ] Automated deployment pipeline to Vercel
- [ ] Token spend tracking and cost optimization in place

### V1.0 (8 weeks)
- [ ] Full Skills library for Studex deal categories
- [ ] Cross-platform automation (WhatsApp, Telegram, Discord)
- [ ] QA automation with accessibility + SEO checks
- [ ] Non-technical team members shipping features via natural language

### V2.0 (12 weeks)
- [ ] Self-optimizing agent routing based on task complexity
- [ ] Automated A/B testing of generated UIs
- [ ] Real-time cost dashboards and budget alerts
- [ ] Community Skills marketplace for Studex ecosystem

---

## 13. References & Sources

- **Primary Source:** Jack Roberts (@Itssssss_Jack) — [YouTube Video](https://www.youtube.com/watch?v=C4fTWiOGXpM)
- **Written Guide:** [Most People Are Using Google AntiGravity Wrong](https://medium.com/@usmanhaider0784/most-people-are-using-google-antigravity-wrong-here-is-how-to-do-it-right-5dcbbcc684f0) by Gen 99K
- **Google AntiGravity:** https://antigravity.google.com/
- **Free Resources:** https://aijack.gumroad.com/l/AntiGravity
- **OpenClaw Documentation:** https://docs.openclaw.ai/concepts/model-providers
- **Google Bans Context:** [VentureBeat Coverage](https://venturebeat.com/orchestration/google-clamps-down-on-antigravity-malicious-usage-cutting-off-openclaw-users)

---

*This PRD was generated from video content analysis. For maximum accuracy, team members should watch the full video and validate requirements against the original demonstration.*
