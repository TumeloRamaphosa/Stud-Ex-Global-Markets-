# BMAD Brief: Marketing Skill App

**Date:** 2026-03-20
**Status:** Implemented
**Author:** Studex Global Markets Engineering
**Full PRD:** [PRD-MARKETING-SKILL-APP.md](../../PRD-MARKETING-SKILL-APP.md)

> Note: This brief was generated retroactively from the existing PRD.
> Future skills will go through the full Ralph Wiggum Loop → BMAD → GSD cycle.

---

## 1. Problem Statement
Users spend hours manually creating marketing content, have no cross-platform strategy,
no data-driven iteration, inconsistent posting, and no conversion tracking. This kills
algorithmic reach and makes ROI invisible.

## 2. Target Users
| Persona | Description | Primary Need |
|---------|-------------|--------------|
| Deal Promoter | Entrepreneur with listed assets/deals | Automated social marketing |
| Platform Marketer | Studex admin promoting the platform | High-volume multi-channel content |
| Verified Trader | Active deal pipeline trader | Personal brand + deal flow analytics |

## 3. Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Posts per user per week | 21+ (3x daily) | Upload-Post history |
| Platforms per campaign | 5+ simultaneously | Platform results tracking |
| Monthly active marketing users | 50+ within 3 months | Firestore user count |
| Conversion tracking enabled | >60% of campaigns | RevenueCat integration |

## 4. Value Proposition
Automates what Larry's methodology proved at scale (7M+ views, 1M+ TikTok views,
$670/month MRR). Makes repeatable content marketing accessible to all Studex users.

## 5. Competitive Landscape
No existing tool combines AI slideshow generation + Upload-Post multi-platform distribution
+ two-axis diagnostic analytics in one integrated pipeline for a trading/investment platform.

## 6. Core Features (Prioritized)
### P0 — Must Have (MVP) - Implemented
- [x] Marketing profile setup wizard
- [x] AI image generation (OpenAI)
- [x] Text overlay engine (node-canvas)
- [x] Upload-Post multi-platform posting
- [x] Marketing dashboard + content creator pages
- [x] Basic analytics display

### P1 — Should Have (Phase 2)
- [ ] Daily diagnostic reports
- [ ] Hook performance A/B testing
- [ ] Content scheduling engine
- [ ] Campaign manager

### P2 — Nice to Have (Phase 3)
- [ ] Competitor research engine
- [ ] RevenueCat conversion tracking
- [ ] Batch API for cost savings

## 7. Agent Architecture
| Agent | Role | Inputs | Outputs | Automation Level |
|-------|------|--------|---------|------------------|
| Content Generator | Create slideshows | Profile, hook template | 6-slide images | Full |
| Text Overlay Agent | Apply text to slides | Images, overlay text | Final slides | Full |
| Distribution Agent | Post to platforms | Slides, caption, platforms | Post URLs | Full |
| Analytics Agent | Pull daily metrics | Profile, platforms | Analytics snapshot | Full |
| Diagnostic Agent | Classify performance | Views, conversions | Action recommendations | Full |

## 8. Technical Architecture
- **Frontend:** Next.js 14 — 5 marketing routes
- **Backend:** Firebase Cloud Functions — 8 marketing endpoints
- **Database:** Firestore — 6 marketing collections
- **External APIs:** Upload-Post, OpenAI, Stability AI, Replicate, RevenueCat

## 9. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Upload-Post downtime | Posts fail | Queue + retry logic |
| OpenAI rate limits | Image delays | Multi-provider support |
| TikTok algorithm changes | Reduced reach | Data-driven iteration |
| API key exposure | Security breach | Server-side only storage |

---

*Generated retroactively by BMAD Consulting Skill v1.0.0*
