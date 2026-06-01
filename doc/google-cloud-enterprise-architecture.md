# Naledi — Google Cloud Enterprise Architecture
## Fully-Online, Agent-Run Software Factory

**Date:** 2026-04-24  
**Platform:** Google Cloud Platform (Enterprise Grade)  
**Model:** Fully cloud-native — zero local infrastructure dependency  

---

## 1. EXECUTIVE SUMMARY

This architecture runs Naledi entirely on Google Cloud. Every agent, every service, every client interaction is hosted in GCP. The M4 Mac Mini is used only as a **local development and fallback node** — the production system is 100% cloud.

**Why Google Cloud Enterprise?**
- Vertex AI Model Garden gives native Claude 3.5 Sonnet access with SLA
- Google Cloud's African regions (Johannesburg, soon Lagos) for low latency
- Enterprise-grade security (VPC-SC, CMEK, Cloud Armor)
- Google Workspace integration for meeting bots, email, calendars
- Firebase for rapid client-facing app development

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  Web App (Firebase Hosting) │ WhatsApp API │ Voice (Twilio + Google TTS)    │
│  Google Meet Bot │ Email (Gmail API) │ Mobile App (Flutter)              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS / WebSocket
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                         API GATEWAY (Cloud Endpoints)                       │
│                    + Cloud Armor (DDoS + WAF protection)                    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                       ORCHESTRATION LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Vertex AI Agent Builder  —  Conversational frontend, voice, chat   │    │
│  │  LangGraph Runtime on GKE Autopilot  —  Core agent orchestrator    │    │
│  │  Firestore  —  Agent state, session memory                        │    │
│  │  Vertex AI Vector Search  —  RAG memory, codebase embeddings      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ Pub/Sub Event Bus
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│   INGESTION   │       │    BUILD      │       │   DELIVERY    │
│   AGENTS      │       │   AGENTS      │       │   AGENTS      │
│  (Cloud Run)  │       │  (GKE/GCR)    │       │  (Cloud Fn)   │
└───────────────┘       └───────────────┘       └───────────────┘
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  Cloud SQL    │       │  Cloud Build  │       │  Cloud Deploy   │
│  BigQuery     │       │  Artifact Reg │       │  Cloud CDN      │
│  Cloud Storage│       │  GKE Sandbox  │       │  Firebase Hosting│
└───────────────┘       └───────────────┘       └───────────────┘
```

---

## 3. SERVICE-TO-AGENT MAPPING

| Agent | GCP Service | Purpose | Scaling |
|-------|-------------|---------|---------|
| **Orchestrator** | GKE Autopilot + LangGraph | Decomposes projects, dispatches tasks | 2–10 pods |
| **Estimator** | Cloud Run | Generates quotes in <2s | 0–100 instances |
| **Architect** | Cloud Run | Designs system architecture | 0–20 instances |
| **CodeGen** | Cloud Run + GKE | Writes source code | 1–50 pods |
| **Test** | Cloud Build + GKE Sandbox | Runs tests, security scans | On-demand |
| **Deploy** | Cloud Deploy | Manages rollouts | Managed |
| **Delivery** | Cloud Functions | Notifies, provisions access | 0–1000 instances |
| **Support** | Cloud Run + Dialogflow CX | 24/7 customer service | 0–50 instances |
| **Meeting Bot** | Cloud Functions + Meet API | Joins calls, transcribes | On-demand |
| **Sales** | Cloud Run + Vertex AI | Qualifies leads, books demos | 0–20 instances |
| **Remote Fix** | Cloud Run + Cloud Ops | Auto-detects and fixes issues | 1–5 instances |

---

## 4. DETAILED COMPONENT DESIGN

### 4.1 Client Layer

**Web Application:**
- Framework: Next.js 14 (App Router)
- Hosting: Firebase Hosting + Cloud CDN
- Auth: Firebase Authentication (Google, email, phone)
- Real-time: Firebase Realtime Database for live build status

**WhatsApp Business API:**
- Provider: 360dialog or Meta direct (via Cloud Functions webhook)
- All client communication async via WhatsApp
- AI agent reads/writes messages via webhook

**Voice Avatar:**
- Speech-to-Text: Google Cloud Speech-to-Text (v2, streaming)
- TTS: Google Cloud Text-to-Speech (Neural2, WaveNet)
- Languages: English (en-ZA), isiZulu (zu-ZA), isiXhosa (xh-ZA), Afrikaans (af-ZA)
- Telephony: Twilio SIP trunk → Cloud Functions → Vertex AI

**Email:**
- Gmail API (Google Workspace) for `build@naledi.ai`
- Microsoft Graph API fallback for Outlook users
- Cloud Functions webhook on new message

**Mobile App:**
- Flutter (cross-platform: iOS + Android)
- Firebase Flutter SDK for auth, notifications, real-time updates

### 4.2 API Gateway

**Cloud Endpoints:**
- OpenAPI spec for all public APIs
- API key + OAuth2 authentication
- Rate limiting per client tier
- Cloud Armor integration for DDoS protection

**Endpoints:**
```
POST /v1/quote           → Estimator Agent
POST /v1/projects        → Orchestrator Agent
GET  /v1/projects/{id}   → Firestore read
POST /v1/payments        → Payment webhook handler
POST /v1/support         → Support Agent
POST /v1/meetings        → Meeting Bot Agent
WS   /v1/stream          → Real-time build updates
```

### 4.3 Orchestration Layer

**Vertex AI Agent Builder:**
- Handles natural language client interactions
- Multi-turn conversations for requirement gathering
- Integrates with Firestore for context memory
- Can hand off to LangGraph for complex multi-agent workflows

**LangGraph on GKE Autopilot:**
- Runtime for the core agent orchestrator
- Stateful graph execution with checkpointing to Firestore
- Retries, timeouts, and parallel agent dispatch

**Firestore:**
- Collection: `projects` — project state, requirements, milestones
- Collection: `agents` — agent status, heartbeat, queue depth
- Collection: `sessions` — client conversation history
- Collection: `payments` — payment status, escrow ledger

**Vertex AI Vector Search:**
- Index: `code-embeddings` — embeddings of generated code for similarity search
- Index: `kb-articles` — knowledge base for support answers
- Index: `requirements` — historical requirements for estimation

### 4.4 Ingestion Agents

**Estimator Agent (Cloud Run):**
```python
# Trigger: HTTP POST /v1/quote
# Input: requirements JSON
# Output: quote JSON with breakdown

import vertexai
from vertexai.generative_models import GenerativeModel

model = GenerativeModel("claude-3-5-sonnet@vertex")

def estimate(req):
    prompt = f"Estimate cost and time for: {req}"
    response = model.generate_content(prompt)
    return parse_quote(response.text)
```

**Payment Webhook Handler (Cloud Functions):**
```python
# Trigger: HTTP POST from Paystack/PayFast/Ozow
# Action: Verify signature, update Firestore, trigger build

def payment_webhook(request):
    payload = verify_signature(request)
    update_payment_status(payload)
    if payload.milestone == 1:
        publish_pubsub("build.start", payload.project_id)
    return "OK", 200
```

### 4.5 Build Agents

**CodeGen Agent (Cloud Run + GKE):**
- Receives Pub/Sub message: `build.start`
- Calls Claude 3.5 Sonnet via Vertex AI Model Garden
- Generates code in structured format (file tree + contents)
- Stores output in Cloud Storage bucket
- Publishes: `build.code_complete`

**Test Agent (Cloud Build):**
- Trigger: GCS object creation (code artifact)
- Steps:
  1. Lint (ESLint, Prettier, Ruff, mypy)
  2. Unit tests (pytest, Jest, Vitest)
  3. Integration tests (Playwright, Cypress)
  4. Security scan (Snyk, Artifact Registry scanning)
  5. POPIA compliance (PII detection via Cloud DLP)
- Publishes: `build.test_complete` (pass/fail)

**Deploy Agent (Cloud Deploy):**
- Trigger: Pub/Sub `build.test_pass`
- Steps:
  1. Build container image (Cloud Build)
  2. Push to Artifact Registry
  3. Deploy to Cloud Run (canary: 10% → 50% → 100%)
  4. Health check
  5. Rollback on failure
- Publishes: `deploy.complete`

### 4.6 Delivery Agents

**Delivery Agent (Cloud Functions):**
- Trigger: Pub/Sub `deploy.complete`
- Actions:
  1. Generate client documentation (Vertex AI)
  2. Create training video script (Vertex AI + Cloud Text-to-Speech)
  3. Send WhatsApp + email notification
  4. Update Firestore project status
  5. Release escrow payment (if final milestone)

### 4.7 Support Agent (Cloud Run + Dialogflow CX)

**24/7 Autonomous Support:**
- Dialogflow CX for intent classification
- Vertex AI for generative responses
- Firestore for client project context
- Cloud Functions for actions (refund, redeploy, escalate)

**Intents:**
- `quote.status` — "When will my site be ready?"
- `payment.issue` — "I was charged twice"
- `feature.request` — "Can you add a booking form?"
- `bug.report` — "My checkout is broken"
- `refund.request` — "I want my money back"
- `human.escalate` — "I need to speak to a person"

**Multi-language:**
- Cloud Translation API pre-processes non-English input
- Response generated in English, then translated back
- Or use multilingual Claude 3.5 Sonnet directly

### 4.8 Meeting Bot Agent (Cloud Functions + Meet API)

**Google Meet Integration:**
```
Client books meeting → Google Calendar event created →
Cloud Scheduler triggers bot 1 min before meeting →
Bot joins via Google Meet API →
Speech-to-Text streams audio → Vertex AI processes →
TTS responds via bot voice →
Meeting ends → Summary generated → Tickets created →
WhatsApp + email summary sent
```

**Zoom Integration (fallback):**
- Zoom Meeting SDK for bot joining
- Same pipeline as Google Meet

### 4.9 Remote Fix Agent (Cloud Run + Cloud Operations)

**Issue Detection:**
- Cloud Monitoring alerts on client app errors
- Cloud Error Reporting aggregates exceptions
- Cloud Logging patterns detect anomalies

**Auto-Fix Pipeline:**
```
Alert triggered → Cloud Function ingests →
Remote Fix Agent diagnoses →
  [Known issue] → Fetch fix from KB → Apply via API → Verify → Notify
  [Unknown issue] → Generate fix with Claude → Code review → Deploy → Verify
  [Complex] → Queue for human + notify client with ETA
```

**Client System Access:**
- Chrome Remote Desktop API (for web apps)
- Lightweight agent installed on client servers (Go binary, ~5MB)
- SSH via Identity-Aware Proxy (IAP) for GCP-hosted clients
- Cloud Operations agent for resource monitoring

---

## 5. SECURITY ARCHITECTURE

### 5.1 Network Security

| Layer | Control | GCP Service |
|-------|---------|-------------|
| Edge | DDoS protection, WAF | Cloud Armor |
| API | Rate limiting, auth | Cloud Endpoints + IAM |
| Service | mTLS, service mesh | Anthos Service Mesh (optional) |
| Data | Encryption at rest | CMEK |
| Transit | Encryption in transit | TLS 1.3 |

### 5.2 Tenant Isolation

- Each client gets a dedicated Cloud Run service for preview deployments
- GKE namespaces isolate production workloads
- VPC-SC restricts data exfiltration
- IAM conditions enforce least privilege

### 5.3 Compliance

- **POPIA:** Cloud DLP for PII detection, data residency in Johannesburg region
- **GDPR:** Data processing agreement with Google Cloud
- **PCI-DSS:** Paystack/PayFast handle card data (tokenized)
- **ISO 27001:** Google Cloud certified; Naledi inherits controls

---

## 6. SCALABILITY DESIGN

### 6.1 Concurrent Clients

| Metric | Target | GCP Mechanism |
|--------|--------|---------------|
| 100 concurrent quotes | <2s latency | Cloud Run concurrency=80 |
| 50 active builds | 48h delivery | GKE Autopilot node scaling |
| 1000 support chats | 24/7 | Cloud Run + Dialogflow CX |
| 100 meeting bots | Real-time | Cloud Functions + Cloud Run |

### 6.2 Cost Optimization

| Strategy | Implementation |
|----------|----------------|
| Spot instances | GKE Autopilot spot pods for test agents |
| Committed use | 1-year CUD for Cloud Run base capacity |
| Local fallback | M4 Mac Mini for off-peak coding tasks |
| Batch processing | BigQuery for analytics, not real-time queries |
| Lifecycle policies | GCS object deletion after 90 days |

---

## 7. GCP PROJECT STRUCTURE

```
naledi-prod/                    # Production project
├── compute/
│   ├── cloud-run/              # Service definitions
│   ├── gke/                    # Cluster configs
│   └── cloud-functions/        # Function sources
├── ai/
│   ├── vertex-ai/              # Model deployments
│   ├── dialogflow/             # Agent configs
│   └── vector-search/          # Index definitions
├── data/
│   ├── firestore/              # Security rules
│   ├── bigquery/               # Dataset schemas
│   └── cloud-sql/              # Migration scripts
├── storage/
│   └── cloud-storage/          # Bucket policies
├── networking/
│   ├── vpc/                    # VPC configs
│   └── cloud-armor/            # WAF rules
├── security/
│   ├── iam/                    # Policy bindings
│   └── secret-manager/         # Secret versions
├── cicd/
│   ├── cloud-build/            # Build configs
│   └── cloud-deploy/           # Pipeline configs
└── monitoring/
    ├── alerts/                 # Alert policies
    └── dashboards/             # Monitoring dashboards

naledi-staging/                 # Staging project (mirror)
naledi-dev/                     # Dev project (lightweight)
```

---

## 8. DISASTER RECOVERY

| Scenario | RTO | RPO | Mitigation |
|----------|-----|-----|------------|
| Load shedding (SA) | 0s | 0s | Cloud-native, no local dependency |
| GCP region outage | 15 min | 5 min | Multi-region Firestore, Cloud SQL replicas |
| Agent failure | 5 min | 0s | Health checks, auto-restart, Pub/Sub retries |
| Data corruption | 1 hr | 1 hr | Cloud SQL point-in-time recovery, GCS versioning |
| Security breach | 1 hr | 0s | VPC-SC lockdown, IAM audit, Cloud DLP |

---

## 9. MIGRATION PATH FROM MAC MINI TO FULL CLOUD

| Phase | Duration | Action |
|-------|----------|--------|
| **Hybrid** | Month 1–2 | M4 runs local models; cloud handles orchestration + delivery |
| **Cloud-primary** | Month 3–4 | Cloud runs 80% of workloads; M4 is dev/test only |
| **Full cloud** | Month 5+ | M4 retired or used for R&D; all production in GCP |

---

## 10. NEXT STEPS

1. **Create GCP projects:** `naledi-prod`, `naledi-staging`, `naledi-dev`
2. **Enable APIs:** Vertex AI, Cloud Run, Firestore, Pub/Sub, Cloud Build
3. **Deploy LangGraph orchestrator** to GKE Autopilot
4. **Connect Claude via Vertex AI Model Garden**
5. **Build Estimator Agent** as first Cloud Run service
6. **Set up Firebase Hosting** for client web app
7. **Configure Paystack webhook** to trigger build pipeline
