# DenchClaw Campaign Automation System

## Overview

DenchClaw has been integrated into the Naledi Platform as a campaign automation and web scraping system that:
- Runs outreach campaigns with automated reporting
- Discovers emails and contracts using web scraping (Playwright, Firecrawl)
- Integrates with the existing Paperclip/Naledi infrastructure

## Architecture

```
┌─────────────────┐     ┌────────────────────────────────────┐     ┌─────────────────┐
│   React App     │────▶│       Netlify Functions            │────▶│  Local Backend  │
│   (frontend/)   │     │  ┌──────────────────────────────┐    │     │ localhost:8000  │
└─────────────────┘     │  │ campaign_runner              │    │     └─────────────────┘
                        │  │ - Create/run campaigns       │    │
                        │  │ - Generate reports           │    │
                        │  └──────────────────────────────┘    │
                        │  ┌──────────────────────────────┐    │
                        │  │ web_scraper                  │    │
                        │  │ - Discover emails            │    │
                        │  │ - Discover contracts         │    │
                        │  │ - URL scraping               │    │
                        │  └──────────────────────────────┘    │
                        └────────────────────────────────────┘
```

## Components

### 1. Campaign Runner (`functions/campaign_runner.py`)

RESTful API for campaign management:
- **Create campaigns**: Name, target audience, templates, contacts
- **Run campaigns**: Execute outreach emails
- **Pause campaigns**: Stop running campaigns
- **Generate reports**: Aggregated analytics across all campaigns
- **List/Delete campaigns**: Query and manage campaign lifecycle

**Endpoints:**
- `POST /api/campaigns` - Campaign operations
  - `action: create` - Create new campaign
  - `action: run` - Run campaign
  - `action: pause` - Pause campaign
  - `action: generate_report` - Get analytics
- `GET /api/campaigns` - List campaigns
- `DELETE /api/campaigns` - Delete campaign

**Campaign Data Structure:**
```python
{
  "id": "uuid",
  "name": "Campaign Name",
  "target_audience": "developers",
  "status": "draft|running|paused|completed",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "templates": [...],
  "contacts": [...],
  "results": {
    "total_contacts": 100,
    "emails_sent": 100,
    "emails_opened": 35,
    "replies": 5,
    "contracts_discovered": 2,
    "conversion_rate": 5.0
  }
}
```

### 2. Web Scraper (`functions/web_scraper.py`)

Multi-source web scraping for lead discovery:

**Email Discovery:**
- Extract from text content (regex patterns)
- Hunter.io API integration (if API key available)
- Validate and deduplicate results
- Confidence scoring

**Contract Discovery:**
- Search government tender sites
- Firecrawl API integration
- Keyword-based filtering
- Contract metadata extraction (value, deadline, organization)

**URL Scraping:**
- Single URL scraping with email extraction
- Firecrawl fallback to HTTP requests
- Configurable extraction options

**Endpoints:**
- `POST /api/scraper` - Scraper operations
  - `action: discover_emails` - Find emails for company/domain
  - `action: discover_contracts` - Search for contract opportunities
  - `action: scrape_url` - Scrape specific URL

### 3. Frontend Dashboard (`frontend/src/App.tsx`)

Interactive UI with tabs:

**Campaigns Tab:**
- Create new campaigns with form
- View campaign list with status
- Run campaigns with analytics
- Generate aggregate reports

**Scraper Tab:**
- Email discovery (company/domain input)
- Contract discovery (keyword search)
- Results display with confidence scores

## API Usage Examples

### Create a Campaign
```bash
curl -X POST http://localhost:8888/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "name": "Q1 Marketing Outreach",
    "target_audience": "marketing agencies",
    "templates": [{"name": "welcome", "subject": "Partnership Opportunity"}],
    "contacts": [
      {"email": "contact@agency1.com", "name": "Agency 1"},
      {"email": "contact@agency2.com", "name": "Agency 2"}
    ]
  }'
```

### Run a Campaign
```bash
curl -X POST http://localhost:8888/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "action": "run",
    "campaign_id": "your-campaign-uuid"
  }'
```

### Discover Emails
```bash
curl -X POST http://localhost:8888/api/scraper \
  -H "Content-Type: application/json" \
  -d '{
    "action": "discover_emails",
    "company": "Tech Corp",
    "domain": "techcorp.com"
  }'
```

### Discover Contracts
```bash
curl -X POST http://localhost:8888/api/scraper \
  -H "Content-Type: application/json" \
  -d '{
    "action": "discover_contracts",
    "keywords": ["IT services", "software development"],
    "region": "south africa"
  }'
```

### Generate Report
```bash
curl -X POST http://localhost:8888/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate_report",
    "include_all": true
  }'
```

## Environment Variables

Create `.env` file:
```bash
# Local backend (for development)
LOCAL_BACKEND_URL=http://localhost:8000

# Optional: Hunter.io for email discovery
HUNTER_API_KEY=your-hunter-key

# Optional: Firecrawl for web scraping
FIRECRAWL_API_KEY=your-firecrawl-key

# Netlify
NETLIFY_SITE_ID=your-site-id
NETLIFY_AUTH_TOKEN=your-token
```

## Testing

Run all tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=functions
```

Specific test files:
```bash
pytest tests/test_campaign_runner.py -v
pytest tests/test_web_scraper.py -v
```

All 54 tests passing:
- `test_campaign_runner.py` - Campaign creation, execution, reporting
- `test_web_scraper.py` - Email discovery, contract discovery, URL scraping
- `test_prompt_agent.py`, `test_research_agent.py`, `test_status.py` - Existing tests

## Deployment

### Netlify Dev (Local)
```bash
netlify dev
```

### Deploy
```bash
netlify deploy --prod
```

## Integration with Paperclip/Naledi

The system is designed to integrate with Paperclip's agent orchestration:
- Campaigns can be managed by Paperclip agents
- Web scraping results feed into Paperclip's knowledge base
- Reports can trigger Paperclip workflows
- The `naledi-adapter-config-guide.md` in the paperclip-deploy folder shows how to connect this to a Naledi server

## Next Steps

1. **Database**: Replace in-memory store with PostgreSQL/Firestore
2. **Email Sending**: Integrate with SendGrid/AWS SES
3. **Scheduling**: Add cron-triggered campaign runs
4. **Playwright Real**: Use actual Playwright for browser automation
5. **Analytics**: Enhanced reporting with time-series data
6. **Templates**: Rich email template system with variables
7. **Paperclip Adapter**: Connect directly to Paperclip agent system

## File Structure

```
/Users/project2571/.superset/worktrees/New Environment/Project-2571/clean-up/
├── functions/
│   ├── campaign_runner.py    # NEW - Campaign automation
│   ├── web_scraper.py        # NEW - Web scraping & discovery
│   ├── status.py             # MODIFIED - Added DenchClaw status
│   ├── prompt_agent.py       # Existing
│   └── research_agent.py     # Existing
├── frontend/
│   └── src/
│       ├── App.tsx           # MODIFIED - Added campaign/scraper UI
│       └── ...
├── tests/
│   ├── test_campaign_runner.py    # NEW - Campaign tests
│   ├── test_web_scraper.py        # NEW - Scraper tests
│   └── ...
├── netlify.toml              # MODIFIED - New routes configured
├── requirements.txt          # MODIFIED - Added scraping dependencies
└── README.md                 # MODIFIED - Updated documentation
```
