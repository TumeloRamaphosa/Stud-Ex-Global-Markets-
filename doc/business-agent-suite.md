# Naledi Business Agent Suite

## Executive Summary

The Naledi Business Agent Suite is a collection of five specialized AI agents designed specifically for Small and Medium Enterprises (SMEs) in South Africa and emerging markets. Each agent operates autonomously, integrates deeply with existing business systems, and solves real operational problems — not just chatbot conversations.

These agents are offered as standalone monthly services or bundled with Naledi's software development retainers.

---

## 1. Naledi Meet — Intelligent Meeting Agent

### Purpose & Value Proposition

Naledi Meet joins video calls as a silent participant, transcribes conversations in real-time, extracts action items and decisions, and automatically creates project tickets. It can answer project-status questions during the call using live data from your project management system.

**Core value:** Eliminate meeting admin overhead. Never miss a follow-up. Reduce status-update meetings by 80%.

### Tech Stack (GCP Services)

| Component | Service |
|-----------|---------|
| Video Integration | Google Meet API, Zoom SDK |
| Speech-to-Text | Google Cloud Speech-to-Text (Streaming API) |
| Text-to-Speech | Google Cloud Text-to-Speech (Custom Voice) |
| AI Reasoning | Vertex AI (Gemini 1.5 Pro) |
| Compute | Cloud Functions (event-driven), Cloud Run (session workers) |
| Data Store | Firestore (meeting logs, action items) |
| Scheduling | Google Calendar API |
| Task Sync | REST APIs for Jira / Asana / Monday.com / Linear |

### Integration Points

- **Inbound:** Google Calendar webhooks (meeting starts), manual `/invite @naledi-meet` links
- **Outbound:** Project management tickets, email summaries via SendGrid/Resend, Slack/Teams notifications
- **Real-time:** WebSocket/streaming bridge for live transcription and TTS responses

### Pricing Model (Standalone)

| Tier | Price (ZAR) | Includes |
|------|-------------|----------|
| Starter | R 2,500/mo | 20 meeting hours, basic summaries, email delivery |
| Growth | R 6,500/mo | 50 meeting hours, auto-ticketing, project Q&A, Slack integration |
| Enterprise | R 15,000/mo | Unlimited hours, custom voice, on-premise data option, SLA |

---

## 2. Naledi Brain — Business Problem Solver

### Purpose & Value Proposition

Naledi Brain connects to your existing business systems — accounting, e-commerce, POS, and spreadsheets — analyzes operational patterns, and both *diagnoses* and *fixes* problems by generating and deploying code.

**Core value:** An AI data analyst and junior developer combined. It doesn't just report that inventory is low; it builds the reorder dashboard.

### Tech Stack (GCP Services)

| Component | Service |
|-----------|---------|
| Data Warehouse | BigQuery (multi-tenant datasets per client) |
| ETL / Sync | Cloud Functions + Cloud Scheduler |
| AI Analysis | Vertex AI (Gemini 1.5 Pro, Codey for code generation) |
| Visualization | Looker Studio (embedded), or Cloud Run (custom React dashboards) |
| Workflow Automation | Cloud Workflows, Pub/Sub |
| Code & Deploy | Cloud Source Repositories, Cloud Build, Cloud Deploy |
| Secrets | Secret Manager |

### Integration Points

- **Financial:** QuickBooks Online, Xero, Sage Business Cloud (via OAuth + REST)
- **E-commerce:** Shopify, WooCommerce, Magento (Store API, webhooks)
- **POS:** Yoco, Square, Vend (CSV/SFTP imports or API where available)
- **Data:** Google Sheets (Apps Script connector), BigQuery, Airtable
- **Actions:** Email (Resend/SendGrid), WhatsApp, SMS (Twilio), Slack

### Capabilities by Problem Type

| Problem | Autonomous Action |
|---------|------------------|
| "Inventory always out of stock" | Builds predictive reorder dashboard + sets low-stock alerts |
| "Customers not returning" | Segments cohorts, builds loyalty program flow + email automation |
| "Cash flow unpredictable" | Creates 13-week rolling forecast with scenario modeling |
| "Sales trends unclear" | Generates automated daily/weekly insight briefs to WhatsApp |

### Pricing Model (Standalone)

| Tier | Price (ZAR) | Includes |
|------|-------------|----------|
| Diagnostic | R 4,000 once | Audit + report, no code deployment |
| Solver | R 12,000/mo | 2 active automations, weekly insights, basic dashboards |
| Partner | R 28,000/mo | Unlimited automations, custom code fixes, 4h response SLA, BigQuery included |

---

## 3. Naledi Support — 24/7 Customer Support Agent

### Purpose & Value Proposition

A multilingual support agent that handles refunds, billing queries, technical issues, and feature requests across WhatsApp, web chat, and email. It accesses live project data to answer "when will my site be ready?" and can trigger code fixes or redeployments for technical issues.

**Core value:** Instant resolution in local languages. Engineers only handle legal and payment disputes.

### Tech Stack (GCP Services)

| Component | Service |
|-----------|---------|
| Conversational AI | Dialogflow CX (multilingual intent classification) |
| NLU & Generation | Vertex AI (Gemini for complex reasoning) |
| Messaging | WhatsApp Business API (Cloud API), SendGrid/Resend |
| Web Chat | Firestore (session state), Cloud Run (React chat widget) |
| Project Data | Firestore (project timelines), Cloud Functions (data fetch) |
| Deployment Triggers | Cloud Build API, GitHub/GitLab webhooks |
| Translation | Google Cloud Translation API (real-time for isiZulu, isiXhosa, Afrikaans, Swahili) |
| Observability | Cloud Logging, Error Reporting |

### Integration Points

- **Channels:** WhatsApp Business, embedded web chat, email (SMTP/API)
- **Business Systems:** Stripe/PayPal (refund eligibility), project management (status checks), CRM (customer history)
- **Technical:** GitHub/GitLab (issue creation), Cloud Build (redeploy trigger), Cloud Monitoring (error lookup)

### Escalation Rules

- **Auto-resolve:** Password resets, how-to questions, refund eligibility checks, status updates
- **Auto-fix:** Rollback triggers for failed deployments, cache clears, certificate renewal
- **Human handover:** Legal disputes, chargebacks, payment gateway errors, angry sentiment + repeat contact

### Pricing Model (Standalone)

| Tier | Price (ZAR) | Includes |
|------|-------------|----------|
| Basic | R 3,500/mo | 500 conversations, WhatsApp + email, business hours |
| Standard | R 8,000/mo | 2,000 conversations, 24/7, 5 languages, auto-fixes |
| Premium | R 18,000/mo | Unlimited conversations, all languages, technical redeployments, SLA |

---

## 4. Naledi Sales — Autonomous SDR

### Purpose & Value Proposition

Proactively qualifies leads, generates custom quotes, books demo calls with an AI avatar, and follows up relentlessly until closed or declined. Integrates with your calendar and CRM.

**Core value:** A 24/7 sales development rep that never forgets to follow up and speaks your customer's language.

### Tech Stack (GCP Services)

| Component | Service |
|-----------|---------|
| Lead Scoring | Vertex AI (predictive models on CRM data) |
| Outreach | WhatsApp Business API, SendGrid/Resend |
| Conversation | Dialogflow CX + Vertex AI (Gemini for negotiation) |
| Scheduling | Google Calendar API, Cal.com API |
| Demos | Cloud Run (AI avatar relay), or integration with HeyGen/Synthesia |
| Follow-ups | Cloud Tasks (deferred queue), Firestore (lead state machine) |
| Quotes | Cloud Functions + Google Docs/Sheets API (template fill) |
| CRM Sync | HubSpot / Salesforce / Pipedrive REST APIs |

### Integration Points

- **Inbound:** Website forms, landing pages, WhatsApp click-to-chat, social DMs
- **Outbound:** WhatsApp templates, email sequences, LinkedIn automation (via PhantomBuster or similar)
- **Booking:** Google Calendar, Zoom/Meet links
- **CRM:** HubSpot, Salesforce, Pipedrive, monday.com CRM
- **Payments:** Stripe Quotes, PayPal invoicing

### Pricing Model (Standalone)

| Tier | Price (ZAR) | Includes |
|------|-------------|----------|
| Pay-per-Lead | R 150/lead | Qualification, 3 touchpoints, handover to human |
| Growth | R 10,000/mo | 50 leads, full follow-up sequence, quote generation, calendar booking |
| Scale | R 25,000/mo | 200 leads, AI avatar demos, CRM auto-sync, performance dashboard |

---

## 5. Naledi Welcome — Client Onboarding Agent

### Purpose & Value Proposition

Guides new clients through platform setup, collects business information via conversational UI, provisions Google Workspace or Microsoft 365, configures payment methods, and creates project workspaces with stakeholders invited.

**Core value:** Reduce client onboarding from 2 weeks to 2 hours. Clients are productive from day one.

### Tech Stack (GCP Services)

| Component | Service |
|-----------|---------|
| Conversational UI | Dialogflow CX, Cloud Run (React/Vue onboarding wizard) |
| Data Collection | Firestore (progressive profile building), Cloud Storage (document uploads) |
| Identity & Provisioning | Google Workspace Admin SDK, Microsoft Graph API |
| Payments | Stripe API, PayPal API, Cloud Functions (webhook handlers) |
| Project Setup | Cloud Functions + Firestore (workspace creation), REST APIs for Notion/Monday/Asana |
| Email | SendGrid/Resend (welcome sequences, stakeholder invites) |
| AI Assist | Vertex AI (document parsing, form pre-fill, FAQ answers) |

### Integration Points

- **Identity:** Google Workspace, Microsoft 365, custom SAML/OAuth
- **Payments:** Stripe (subscriptions + invoicing), PayPal, Yoco
- **Project Tools:** Notion, Monday.com, Asana, Jira, Slack
- **Documents:** Google Drive, SharePoint, Cloud Storage
- **Comms:** Email, Slack, WhatsApp (stakeholder invites)

### Onboarding Flow

1. **Discovery:** Business type, size, industry, goals (conversational)
2. **Data Collection:** Logo, brand colors, tax info, contact details (progressive form)
3. **Provisioning:** Google Workspace/Microsoft 365 creation, user accounts, shared drives
4. **Payment Setup:** Payment method collection, subscription activation, invoicing rules
5. **Project Kickoff:** Workspace created, stakeholders invited, first milestone scheduled

### Pricing Model (Standalone)

| Tier | Price (ZAR) | Includes |
|------|-------------|----------|
| Self-Service | R 2,500 once | Guided setup, 1 admin user, basic integrations |
| Assisted | R 7,500 once | White-glove onboarding, 10 users, custom domain, training video generation |
| Enterprise | R 20,000 once | Unlimited users, custom integrations, dedicated onboarding manager + AI agent |

---

## Cross-Cutting Architecture

### Security & Compliance

- **Isolation:** Firestore collection-per-tenant, BigQuery dataset-per-tenant, VPC-SC for data exfiltration prevention
- **Auth:** Identity-Aware Proxy (IAP) for internal dashboards, OAuth 2.0 for all third-party connectors
- **Secrets:** Cloud KMS + Secret Manager for API keys, tokens, and credentials
- **Audit:** Cloud Audit Logs for all agent actions, Admin Activity logs

### Observability

- **Logging:** Structured JSON logs to Cloud Logging per agent
- **Monitoring:** Cloud Monitoring dashboards for conversation volume, API latency, error rates
- **Alerting:** PagerDuty/Opsgenie integration for agent failures and quota breaches

### Deployment

- **Primary:** Cloud Run (stateless HTTP services, autoscaling)
- **Events:** Cloud Functions (webhooks, scheduled jobs, Pub/Sub triggers)
- **Queues:** Cloud Tasks (deferred work), Pub/Sub (async event bus)
- **Data:** Firestore (NoSQL), BigQuery (analytics), Cloud Storage (files/exports)

---

## Bundling with Software Development

| Bundle | Agents Included | Monthly Price | Best For |
|--------|----------------|-------------|----------|
| **Launch** | Welcome + Support | R 12,000 | New product launches, MVPs |
| **Growth** | Meet + Brain + Support | R 25,000 | Scaling SMEs, operational efficiency |
| **Scale** | All 5 Agents | R 45,000 | Established businesses, full automation |
| **Custom** | Pick any 3+ | POA | Enterprise or specialized needs |

*All bundles include shared BigQuery warehouse, Cloud Run hosting, and standard integrations. Custom development billed separately.*

---

## Next Steps

1. **Validate demand:** Interview 3–5 existing Naledi clients on which agent solves their biggest pain point.
2. **MVP priority:** Build Naledi Support first (highest recurring value, lowest integration complexity).
3. **Infrastructure:** Provision multi-tenant GCP project with VPC-SC and IAM foundations.
4. **Partnerships:** Apply for WhatsApp Business Solution Provider and Google Workspace Reseller status.
5. **Pricing pilot:** Offer 3-month discounted trials at 50% to refine pricing tiers based on usage data.
