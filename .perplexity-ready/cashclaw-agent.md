# Ready
Page: cashclaw-agent
Built by: Claude Code
Date: 2026-05-30
Branch: claude/instagram-analytics-prd-qSt5w

## What Was Built

### CashClaw — AI Operations Agent for StudEx Meat

CashClaw is an autonomous AI agent that controls the meat store's operations.
It uses Claude for reasoning, AgentMail for email campaigns, and reports to Slack + Discord.

### API Routes Created

#### POST /api/agent — CashClaw Agent Controller (10 workflows)

| Workflow | What It Does |
|----------|-------------|
| `daily_report` | Pulls Shopify + QuickBooks + AgentMail data, generates AI analysis, posts to Slack/Discord |
| `generate_content` | Creates social/email content for any product using store data context |
| `run_email_campaign` | Sends mass email via AgentMail using built-in templates |
| `revenue_analysis` | Analyzes 30-day revenue + suggests promotions and optimizations |
| `inventory_check` | Checks Shopify stock levels, alerts Slack/Discord on low/negative inventory |
| `invoice_pipeline` | Processes all pending invoices through QuickBooks automatically |
| `customer_outreach` | Identifies lapsed customers (balance=0) and can auto-send re-engagement emails |
| `report_slack` | Post any message to Slack |
| `report_discord` | Post any message to Discord |
| `ask_agent` | Ask CashClaw any question about the business — gets live data context |

#### POST /api/agentmail — AgentMail Mass Email (10 actions)

| Action | Purpose |
|--------|---------|
| `list_inboxes` | List all AgentMail inboxes |
| `create_inbox` | Create CashClaw's inbox |
| `send_email` | Send single email |
| `send_campaign` | Mass email with batching + rate limiting |
| `list_threads` | View email threads |
| `get_metrics` | Email delivery metrics |
| `list_lists` | View contact lists |
| `create_list` | Create a contact list |
| `add_to_list` | Add emails to a list |
| `get_templates` | View built-in email templates |

### Built-In Email Templates

1. `biltong_promo` — Wagyu biltong + droewors promotion with prices
2. `wagyu_box` — Premium cuts box promotion (Ribeye, Fillet, Rump, Sirloin)
3. `ankole_intro` — Ankole heritage beef introduction campaign

All templates have StudEx Meat branding (gold #D4A017, cream #FFF8F0).

### Dashboard

`/agent-dashboard` — CashClaw control panel with:
- Command Center (trigger any workflow)
- Email Campaigns (template selector + recipient list)
- Ask CashClaw (chat interface)
- Channels (Slack + Discord status + test)

### How to call via API (for external agents / CashClaw itself)

```bash
# Run daily report
curl -X POST https://datanetics-app.fly.dev/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "daily_report"}'

# Ask a question
curl -X POST https://datanetics-app.fly.dev/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "ask_agent", "question": "What products should we push this week?"}'

# Run biltong promo campaign
curl -X POST https://datanetics-app.fly.dev/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "run_email_campaign", "template": "biltong_promo", "recipients": ["customer@example.com"]}'
```

### ENV VARS NEEDED

```
AGENTMAIL_API_KEY=am_xxx
AGENTMAIL_DOMAIN=agentmail.to (or custom domain)
AGENTMAIL_INBOX_ID=<CashClaw's inbox ID>
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
ANTHROPIC_API_KEY=<already configured>
```

### How CashClaw connects to other agents

CashClaw exposes all its capabilities via REST API. Any agent can call it:
- Perplexity Computer can trigger campaigns and reports
- Other agents can call `ask_agent` to get business intelligence
- n8n workflows can trigger agent actions via HTTP nodes
- Slack/Discord bots can interact via webhooks
