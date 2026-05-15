# Stud-Ex Global Markets - n8n Workflows

This directory contains 10 n8n workflow JSON files for the Stud-Ex Global Markets marketing analytics platform. Each workflow can be imported directly into your n8n instance.

## How to Import Workflows

### Option 1: n8n UI Import
1. Open your n8n instance in a web browser.
2. Click the **"..."** menu in the top-right corner (or go to **Workflows**).
3. Select **"Import from File"**.
4. Choose the desired `.json` file from this directory.
5. The workflow will appear in your editor. Configure credentials, then activate it.

### Option 2: n8n CLI Import
```bash
n8n import:workflow --input=./01-facebook-pages.json
```

### Option 3: n8n API Import
```bash
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: your-api-key" \
  -d @01-facebook-pages.json
```

## Workflows Overview

| # | File | Description | Trigger |
|---|------|-------------|---------|
| 01 | `01-facebook-pages.json` | Facebook Page management: post content and fetch page insights | Webhook |
| 02 | `02-instagram-analytics.json` | Instagram analytics: fetch media and engagement metrics | Schedule (every 6 hours) |
| 03 | `03-shopify-orders.json` | Shopify order notifications to Slack and Google Sheets | Shopify trigger (new order) |
| 04 | `04-whatsapp-business.json` | WhatsApp Business messaging with auto-reply and priority routing | Webhook |
| 05 | `05-gmail-automation.json` | Gmail automation: categorize, label, auto-reply, and forward to Slack | Gmail trigger (new email) |
| 06 | `06-google-ads-reports.json` | Google Ads daily reporting with key metrics to Slack and Sheets | Schedule (daily at 8am) |
| 07 | `07-notion-sync.json` | Notion database sync for campaigns, reports, and metrics | Webhook |
| 08 | `08-slack-notifications.json` | Central Slack notification hub routing events to channels | Webhook |
| 09 | `09-discord-bot.json` | Discord notifications with rich embeds and channel routing | Webhook |
| 10 | `10-agent-mail.json` | Agent Mail automation: parse, categorize, auto-reply, and forward | Schedule (every 15 minutes) |

## Required Credentials

Before activating any workflow, you must configure the following credentials in your n8n instance under **Settings > Credentials**.

### Workflow 01 - Facebook Pages
- **Facebook Graph API** - Page access token with `pages_manage_posts`, `pages_read_engagement`, and `read_insights` permissions

### Workflow 02 - Instagram Analytics
- **Facebook Graph API** - Access token with `instagram_basic`, `instagram_manage_insights` permissions (Instagram uses the Facebook Graph API)

### Workflow 03 - Shopify Orders
- **Shopify API** - Store URL, API key, and API secret with read_orders scope
- **Slack API** - Bot token with `chat:write` permission
- **Google Sheets OAuth2** - OAuth2 credentials with Sheets access

### Workflow 04 - WhatsApp Business
- **Facebook Graph API** - WhatsApp Cloud API access token from Meta Business
- **Slack API** - Bot token with `chat:write` permission

### Workflow 05 - Gmail Automation
- **Gmail OAuth2** - Google OAuth2 credentials with Gmail read/write access
- **Slack API** - Bot token with `chat:write` permission

### Workflow 06 - Google Ads Reports
- **Google Ads OAuth2** - OAuth2 credentials with Google Ads API access and a developer token
- **Slack API** - Bot token with `chat:write` permission
- **Google Sheets OAuth2** - OAuth2 credentials with Sheets access

### Workflow 07 - Notion Sync
- **Notion API** - Internal integration token with access to target databases and pages

### Workflow 08 - Slack Notifications
- **Slack API** - Bot token with `chat:write` permission and access to all target channels

### Workflow 09 - Discord Bot
- No n8n credentials needed. Uses Discord webhook URLs directly. Create webhooks in your Discord server under **Server Settings > Integrations > Webhooks**.

### Workflow 10 - Agent Mail
- **HTTP Header Auth** - Agent Mail API key (set as `Authorization: Bearer <key>`)
- **Slack API** - Bot token with `chat:write` permission

## Configuration Checklist

After importing each workflow:

1. **Open the workflow** in the n8n editor.
2. **Click on each node** that shows a credential warning (yellow triangle).
3. **Select or create** the appropriate credential.
4. **Update placeholder values**:
   - Replace `your-spreadsheet-id` with your actual Google Sheets document ID.
   - Replace `your-notion-campaigns-db-id` and similar placeholders with your Notion database IDs.
   - Replace Discord webhook URLs with your actual server webhook URLs.
   - Replace `YOUR_CUSTOMER_ID` in the Google Ads workflow with your Google Ads customer ID.
5. **Test the workflow** manually using the "Execute Workflow" button.
6. **Activate the workflow** by toggling the Active switch.

## Webhook Endpoints

Several workflows use webhook triggers. After activation, n8n will generate URLs like:

```
https://your-n8n-instance.com/webhook/studex-facebook-post
https://your-n8n-instance.com/webhook/studex-whatsapp-incoming
https://your-n8n-instance.com/webhook/studex-notion-sync
https://your-n8n-instance.com/webhook/studex-slack-hub
https://your-n8n-instance.com/webhook/studex-discord-notify
```

Configure your Stud-Ex application to send events to these endpoints.

## Slack Channels

The workflows reference these Slack channels. Create them in your Slack workspace before activating:

- `#orders` - Shopify order notifications
- `#whatsapp-priority` - Priority WhatsApp messages
- `#leads` - Sales lead emails
- `#google-ads` - Google Ads daily reports
- `#facebook` - Facebook page events
- `#instagram` - Instagram analytics
- `#whatsapp` - WhatsApp events
- `#general-notifications` - Catch-all notifications
- `#sales-leads` - Sales inquiries from Agent Mail
- `#support` - Support requests
- `#partnerships` - Partnership inquiries
- `#inbox` - General incoming emails
