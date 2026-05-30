# Ready
Page: quickbooks-integration
Built by: Claude Code
Date: 2026-05-30
Branch: claude/instagram-analytics-prd-qSt5w

## What Was Built

### /api/quickbooks/route.ts — Full QuickBooks Online API Proxy
Pattern: Same as Perplexity's Shopify integration (/api/shopify)
18 POST actions, action-based routing, test mode (?test=1), auto token refresh.

### Actions Available

| Action | Purpose |
|--------|---------|
| `company_info` | Get company details (name, address, fiscal year) |
| `invoices_recent` | Last N invoices with line items |
| `invoices_unpaid` | All open invoices with balance > 0 |
| `invoices_overdue` | Past-due invoices with days overdue |
| `invoice_get` | Get single invoice by ID |
| `invoice_create` | Create invoice with line items + 15% VAT |
| `invoice_send` | Email invoice to customer |
| `invoice_pdf` | Download invoice as PDF (base64) |
| `customers_all` | List all customers |
| `customer_search` | Search by name or email |
| `customer_create` | Create new customer |
| `items_all` | List all products/services |
| `item_create` | Create new product/service |
| `revenue_summary` | Invoice count + unpaid balance |
| `profit_loss` | P&L report for date range |
| `balance_sheet` | Balance sheet report |
| `tax_rates` | List all tax rates |
| `payment_create` | Record payment against invoice |

### How to call it

```javascript
const res = await fetch('/api/quickbooks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'invoices_recent', limit: 10 })
})
const data = await res.json()
// data.invoices — array of invoice objects
```

### Test mode (works without tokens)

```
GET /api/quickbooks?test=1       → health check with mock
POST /api/quickbooks?test=1      → mock response for any action
```

### ENV VARS NEEDED (set via flyctl secrets or .env.local)

```
QUICKBOOKS_ACCESS_TOKEN=<OAuth2 token from Intuit Developer>
QUICKBOOKS_REFRESH_TOKEN=<for auto-refresh>
QUICKBOOKS_COMPANY_ID=<from QBO URL — the realm ID>
QUICKBOOKS_CLIENT_ID=<OAuth2 app client ID>
QUICKBOOKS_CLIENT_SECRET=<OAuth2 app client secret>
QUICKBOOKS_ENVIRONMENT=production
```

### How to get QuickBooks credentials

1. Go to https://developer.intuit.com/app/developer/qbo/docs/get-started
2. Create an app (or use existing)
3. Get Client ID + Secret from Keys & credentials
4. Use OAuth2 playground to generate tokens
5. Company ID is the number in your QBO URL: `https://qbo.intuit.com/app/invoice?txnId=4883` → check the realm parameter

### n8n Runner Integration

The n8n-runner container now has QuickBooks endpoints:
- `POST /quickbooks/create-invoice` — Full pipeline: search/create customer → create invoice → email
- `GET /quickbooks/invoices` — Recent invoices
- `GET /quickbooks/unpaid` — Unpaid invoices
- `GET /quickbooks/customers` — All customers
- `POST /quickbooks/payment` — Record payment

### Invoice Creation Pipeline (end-to-end)

```
POST /api/n8n { action: "qb_create_invoice" }
  → n8n-runner /quickbooks/create-invoice
    → /api/quickbooks { action: "customer_search" }
    → /api/quickbooks { action: "customer_create" } (if not found)
    → /api/quickbooks { action: "invoice_create" }
    → /api/quickbooks { action: "invoice_send" } (to customer)
    → /api/quickbooks { action: "invoice_send" } (to info@studexmeat.com)
```

## Notes
- Auto-refreshes OAuth2 token when 401 received
- 15% VAT applied automatically to all invoices
- Wagyu wholesale price lookup built into n8n-runner (auto-prices by marble grade)
- PDF download returns base64 for Drive upload
- SQL injection protection on customer_search queries
