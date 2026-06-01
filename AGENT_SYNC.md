# Agent Sync

Current focus:
- Single-container Fly.io deployment
- Next.js public API at `:3000`
- Internal services for CashClaw, Hermes, n8n, Meta Ads, Shopify, QuickBooks, AgentMail

Coordination rules:
- Keep Fly and Manus as separate targets
- Use local `.env` files for secrets
- Commit small slices and sync often

Current repo state:
- The repo has the app/service layout being assembled
- Git remote is not configured yet, so push cannot happen until the remote URL is added
