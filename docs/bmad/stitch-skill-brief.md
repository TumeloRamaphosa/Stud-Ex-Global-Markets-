# BMAD Brief: Google Stitch Data Pipeline Skill

**Date:** 2026-03-25
**Status:** Implemented
**Author:** Studex Global Markets Engineering

> Note: This brief was generated retroactively.
> Future skills will go through the full Ralph Wiggum Loop → BMAD → GSD cycle.

---

## 1. Problem Statement
Studex data lives in silos — marketing analytics in Upload-Post, payments in Stripe,
conversions in RevenueCat, user data in Firestore. There's no unified data layer to
connect insights across services, making it impossible to answer questions like
"which marketing post generated the most revenue?"

## 2. Target Users
| Persona | Description | Primary Need |
|---------|-------------|--------------|
| Platform Admin | Manages Studex operations | Unified cross-service reporting |
| Marketing User | Runs campaigns | Connect marketing spend to revenue |
| Data Analyst | Queries business data | Single source of truth in BigQuery |

## 3. Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Connected data sources | 5+ per active user | stitch_sources count |
| Pipeline success rate | >95% | stitch_sync_history |
| Data freshness | <15 min lag | Last sync timestamp |

## 4. Value Proposition
Eliminates manual data exports and spreadsheet merging. Enables automated
cross-platform reporting and real-time data unification.

## 5. Core Features (Prioritized)
### P0 — Must Have (MVP) - Implemented
- [x] Pipeline CRUD (create, list, run, delete)
- [x] Data source connections (12 source types)
- [x] Destination configuration (Firestore, BigQuery, Storage, Webhook)
- [x] Transform engine (filter, rename, deduplicate)
- [x] Pipeline execution with run tracking
- [x] Sync history and status monitoring
- [x] Firestore security rules (user-scoped)

### P1 — Should Have (Phase 2)
- [ ] Frontend dashboard pages
- [ ] Scheduled pipeline execution via Cloud Scheduler
- [ ] Advanced transforms (aggregate, compute)
- [ ] Real-time sync mode

### P2 — Nice to Have (Phase 3)
- [ ] Visual pipeline builder (drag-and-drop)
- [ ] Data quality monitoring and alerts
- [ ] Pipeline templates marketplace

## 6. Agent Architecture
| Agent | Role | Inputs | Outputs | Automation Level |
|-------|------|--------|---------|------------------|
| Pipeline Runner | Execute ETL pipeline | Pipeline config | Sync results | Full |
| Connection Tester | Verify source connectivity | Source config | Test result | Full |
| Scheduler Agent | Trigger pipelines on schedule | Cron expression | Pipeline runs | Full |
| Transform Agent | Apply data transformations | Raw data + rules | Transformed data | Full |

## 7. Technical Architecture
- **Frontend:** stitch-types.ts + stitch-api.ts (Firestore client)
- **Backend:** 10 Cloud Function endpoints
- **Database:** 7 Firestore collections
- **External APIs:** Google Stitch API (key via firebase functions config)

## 8. API Surface
```
POST   /stitch/pipelines             — Create pipeline
GET    /stitch/pipelines/:userId     — List pipelines
POST   /stitch/pipelines/:id/run     — Run pipeline
GET    /stitch/pipelines/:id/status  — Get run status
DELETE /stitch/pipelines/:id         — Delete pipeline
POST   /stitch/sources               — Connect source
GET    /stitch/sources/:userId       — List sources
POST   /stitch/sources/:id/test      — Test connection
GET    /stitch/sync/:id/history      — Sync history
POST   /stitch/sync/:id/schedule     — Set schedule
```

## 9. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits | Pipeline failures | Retry logic + backoff |
| Large data volumes | Timeout/memory | Pagination + streaming |
| Source API changes | Broken pipelines | Connection test alerts |
| Data privacy | Compliance risk | User-scoped security rules |

---

*Generated retroactively by BMAD Consulting Skill v1.0.0*
