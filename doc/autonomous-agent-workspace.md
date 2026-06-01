# Autonomous AI Business Workspace — Operational Blueprint

A practical guide to running a South African AI-agent business with automated mail, payments, crypto, and compliance.

---

## 1. AgentMail.to

**What it is:**  
A dedicated email identity for an AI agent (`agent@company.ai`) that ingests client mail, classifies intent, and drafts or sends auto-responses with human escalation rules.

### Setup Pattern

1. **Register domain** (e.g., `company.ai`).
2. **Create mailbox** via Google Workspace, Microsoft 365, or a host like Zoho/Namecheap.
3. **Choose access method:**

#### Option A — IMAP/SMTP (Generic)
- **Read:** Poll or IDLE on `imap.gmail.com:993` / `outlook.office365.com:993`.
- **Send:** Relay via `smtp.gmail.com:587` or `smtp.office365.com:587` using app-specific passwords or OAuth2 tokens.
- **Security:** Store credentials in a secrets manager (AWS Secrets Manager, HashiCorp Vault, or 1Password Secrets Automation). Rotate tokens quarterly.

#### Option B — REST API (Preferred)
- **Google Workspace:** Gmail API (`users.messages.list`, `users.messages.get`, `users.messages.send`). OAuth2 service account with domain-wide delegation.
- **Microsoft 365:** Microsoft Graph API (`/me/messages`, `/me/sendMail`). Client Credentials flow (app-only).
- **Benefit:** No IMAP polling. Webhooks via Google Pub/Sub or Microsoft Graph Change Notifications give near real-time ingestion.

### Classification & Response Loop

```
Email Ingestion → NLP Classifier → Intent Tag (quote / support / build)
     ↓
[quote]  → draft proposal → queue for client review → auto-send if approved
[support]→ search KB / run diagnostics → auto-reply or ticket
[build]  → validate payment milestone → trigger CI/build pipeline
```

- **Reply policy:** Always BCC a human supervisor for the first 30 days. Use confidence threshold (e.g., ≥0.85) to send without review; otherwise queue.
- **Rate limits:** Gmail API = 1 billion quota units per day; Graph = 10k requests/10s. Cache thread IDs to avoid re-processing.

---

## 2. SA Payment Automation

### Best Business Banks for API Access

| Bank | API Offering | Notes |
|------|--------------|-------|
| **FNB** | FNB API / Banking Suite | Strong biz tooling; requires FNB Business account. OAuth + partner program enrollment. |
| **Investec** | Programmable Banking | Best dev experience (Node.js / Python SDK). Good for startups willing to bank with Investec. |
| **Standard Bank** | SimplyBlu / API Services | Enterprise-oriented; REST APIs for payments and statements. |

**Recommendation:** Start with **Investec Programmable Banking** for automation or **FNB** if you need wide branch/ATM access.

### Payment Gateways

| Gateway | Webhooks | Best For |
|---------|----------|----------|
| **Paystack** | Yes — `charge.success`, `invoice.payment_failed`, etc. | Nigerian/SA/EU coverage; clean API; Stripe-like developer experience. |
| **PayFast** | Yes — ITN (Instant Transaction Notifications) | SA-only; widely trusted by local consumers. |
| **Ozow** | Yes — payment notifications via callback | Instant EFT; low fraud; good for bank-to-bank transfers. |

### Webhook Auto-Reconciliation Flow

```
Client pays via Paystack/Ozow
        ↓
Gateway POSTs webhook to https://api.company.ai/webhooks/payments
        ↓
Verify signature (HMAC) → parse payload (amount, gateway_ref, customer_email)
        ↓
Match to open invoice (invoice_number or metadata.order_id)
        ↓
Update Xero/Sage invoice status = "Paid"
        ↓
Trigger downstream build / shipping / project start
```

- **Idempotency:** Store `gateway_ref` in DB; return 200 early for duplicates.
- **Retries:** Queue webhooks in RabbitMQ / AWS SQS if accounting API is down.

### Milestone-Based Escrow Logic (30/40/30 Split)

Use Paystack **Transfer Subaccount** logic or a simple ledger system:

```
Milestone 1 (30%) — On contract signing / quote acceptance
Milestone 2 (40%) — On delivery of beta / prototype
Milestone 3 (30%) — On final sign-off
```

**Implementation:**
- Issue 3 invoices with metadata `milestone: 1/2/3`.
- Webhook listener updates a `project_payments` ledger.
- Gate next CI stage only when `paid_amount >= milestone_threshold`.
- If using a true escrow, consider **TradeSafe** (SA escrow provider) and automate via their API + webhooks.

### Auto-Invoice Generation

**Xero API:**
- OAuth2 app in Xero Developer portal.
- `POST /api.xro/2.0/Invoices` with JSON payload.
- Attach PDF via `PUT /api.xro/2.0/Invoices/{InvoiceID}/Attachments/{Filename}`.
- Enable Xero Webhooks for invoice status changes back to your system.

**Sage Business Cloud Accounting (formerly Sage One):**
- REST API with OAuth2.
- `POST /sales_invoices` to create; webhook support available for status sync.

**Automation tip:** Use a template engine (Handlebars / Jinja) to render line items from a project config YAML, then POST to Xero on quote acceptance.

---

## 3. Crypto Wallet Integration

### Business Wallet

| Wallet | Type | Best For |
|--------|------|----------|
| **Gnosis Safe** (Safe) | Multi-sig smart contract | Low-cost, self-custody. Multi-sig requires 2-of-3 or 3-of-5 approvals. Ideal for small teams. |
| **Fireblocks** | MPC + Policy engine | Enterprise. Insurance, granular roles, direct API swaps. Higher cost. |

**SA startup pick:** Gnosis Safe on Ethereum/Polygon/Base. Upgrade to Fireblocks once AUM > ZAR 5M.

### Accepting Crypto Payments

- **Supported:** USDC (Ethereum, Polygon, Base), BTC, ETH.
- **Deposit flow:**
  1. Generate a unique deposit address per invoice (HD wallet derivation path).
  2. Share address + QR code in invoice email.
  3. Monitor address balances via API.

**Detection APIs:**

| Network | API | Endpoint Pattern |
|---------|-----|------------------|
| Ethereum / Polygon / Base | **Alchemy** | `alchemy.core.getAssetTransfers` or webhook `address_activity` |
| Bitcoin | **BlockCypher** | `GET /addrs/{address}?unspentOnly=true` or WebHook Events |
| All (multi-chain) | **Alchemy Notify** | Webhooks for `ADDRESS_ACTIVITY` on ETH, MATIC, BASE |

**Confirmation rule:** Wait for 12 block confirmations for BTC, 6 for ETH, and 25 for Polygon before marking "Paid".

### SA Off-Ramp & Compliance

| Exchange | Business Account | ZAR Withdrawal |
|----------|------------------|----------------|
| **VALR** | Yes — KYB required | Fast EFT to SA bank |
| **Luno Business** | Yes — KYB required | EFT; good API for balance/price checks |

**Tax & SARS Notes:**
- Crypto is treated as an **asset** by SARS, not currency.
- **Income tax:** If you receive crypto as revenue, declare rand value at time of receipt.
- **CGT:** If you hold crypto and later sell, capital gains tax applies.
- **Invoicing:** Issue ZAR-denominated invoices; record crypto receipt as barter transaction.
- **Audit trail:** Export exchange rate (VALR/Luno spot rate at time of receipt) and tx hash into Xero memo field for your accountant.

---

## 4. Legal & Accounting

### Register a PTY LTD in South Africa

1. **Reserve name** on [CIPC eServices](https://eservices.cipc.co.za/) (or use a shelf company for speed).
2. **File MOI & CoR14.1, CoR14.1A, CoR14.3, CoR15.1C** via CIPC.
3. **Human director requirement:** At least **one director must be a natural person** (not a corporate body). An AI cannot be a director under SA law.
4. **Post-registration:**
   - Register for income tax & provisional tax on [SARS eFiling](https://www.sarsefiling.co.za/).
   - Apply for VAT if turnover > ZAR 1M (voluntary at ZAR 50k).
   - Open business bank account (Investec / FNB / Standard Bank).
   - Register for PAYE/UIF if you hire humans.

### Auto-Accounting via Xero API

- Map Paystack/PayFast/Ozow webhooks to Xero `BankTransactions` or `Payments`.
- Reconcile programmatically:
  - `GET /api.xro/2.0/BankTransactions?Status=UNRECONCILED`
  - Match on amount + date ±1 day, then `POST` reconciliation via `BankTransfer` or update `Payment`.
- Use Xero Tracking Categories for departments: `AI-Build`, `Support`, `Crypto-Revenue`.

### SARS eFiling Integration Possibilities

- **No official REST API** for SARS eFiling for third-party auto-filing as of 2025.
- **Workarounds:**
  - **SARS MobiApp / eFiling:** RPA bots (e.g., UiPath, Playwright) can log in, download IRP6/IT14 returns, and upload completed forms. Use only with internal compliance review.
  - **Third-party tax platforms:** TaxTim for Business or Sage Tax integrate partially; check for API availability annually.
  - **Practical approach:** Auto-generate a monthly tax pack (income, expenses, crypto gains, VAT) and hand to a SAIPA/SAICA-accredited accountant to file on eFiling.

---

## 5. Daily Operations Loop

```
┌─────────────────┐
│  Email arrives  │  ← IMAP/Graph webhook
│ (client quote)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  AI Classifier      │  ← Intent: quote / build / support
│  (NLP + rules)      │
└────────┬────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌──────────┐
│ QUOTE  │  │ SUPPORT  │
│ drafted│  │ ticket   │
└───┬────┘  └────┬─────┘
    │            │
    ▼            ▼
┌─────────────────────┐
│ Client receives     │
│ proposal email      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Payment detected    │  ← Paystack/PayFast/Ozow webhook
│ (milestone 1 = 30%) │  ← or Alchemy/BlockCypher for crypto
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Invoice auto-marked │  ← Xero/Sage API
│ "Paid"              │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ CI/build pipeline   │  ← GitHub Actions / self-hosted runner
│ triggered           │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Status email sent   │  ← AgentMail.to
│ "Build started"     │
└─────────────────────┘
```

**Human oversight gates:**
- Quote > ZAR 50k → require human approval before send.
- Crypto deposit > ZAR 100k → manual off-ramp approval.
- SARS filing → accountant review before submission.

---

## Quick-Start Checklist

- [ ] Register `company.ai` domain and create `agent@company.ai` mailbox.
- [ ] Connect mailbox via Graph/Gmail API with OAuth2 and webhook push.
- [ ] Open Investec or FNB business account; request API credentials.
- [ ] Set up Paystack (or PayFast) business account; configure webhook URL + signature verification.
- [ ] Deploy Gnosis Safe (2-of-3 multisig); generate deposit addresses per invoice.
- [ ] Connect Alchemy Notify for USDC/ETH and BlockCypher for BTC webhooks.
- [ ] Open VALR or Luno Business account for ZAR off-ramp.
- [ ] Register PTY LTD via CIPC; appoint human director.
- [ ] Connect Xero org; create OAuth2 app and map webhooks to invoice lifecycle.
- [ ] Build central webhook router (`/webhooks/{source}`) that normalizes events and writes to queue.
- [ ] Run operations loop for 30 days with human-in-the-middle; tighten auto-send thresholds after review.
