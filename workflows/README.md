# Workflows

Standalone Node.js scripts (v18+ required for native `fetch`). No external dependencies needed.

## Daily VM Audit

Checks Docker containers, Supabase Northstars, Fly.io apps, and Manus VM health. Posts report to Slack/Discord.

```bash
# Set env vars (all optional — missing ones are skipped gracefully)
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ACCESS_TOKEN=your-token
export FLY_API_TOKEN=your-fly-token
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
export DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Run
chmod +x daily-vm-audit.js
./daily-vm-audit.js
```

## Provision Client

Runs the full client onboarding pipeline: AgentMail inbox, VM config, Northstar data, welcome email, Slack notification, KYC activation.

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ACCESS_TOKEN=your-token
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
export BASE_URL=http://localhost:3004

chmod +x provision-client.js
./provision-client.js '{"companyName":"Acme Corp","email":"ceo@acme.com","whatsapp":"+15551234567","agentType":"sales","monthlySpend":500,"riskLevel":"low"}'
```

Required fields: `companyName`, `email`, `agentType`, `monthlySpend`, `riskLevel`. Optional: `whatsapp`.
