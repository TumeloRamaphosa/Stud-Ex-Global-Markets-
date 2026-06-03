# Agent Memory and One-Writer Automation

This stack uses one shared writer and many event-producing agents.

## Roles

- **CashClaw**: business orchestrator and public API surface
- **Hermes**: content and marketing agent
- **TencentDB-Agent-Memory**: structured long-term recall
- **Obsidian**: human-readable system of record
- **Ollama**: local model layer for summarization, classification, and nightly reporting

## Rule

Only the memory writer appends to Obsidian. Other agents emit structured events.

## Event flow

1. An agent completes work.
2. It POSTs a structured event to `POST /api/memory`.
3. The memory writer:
   - appends to the Obsidian daily note if `OBSIDIAN_VAULT_PATH` is set
   - syncs to Tencent memory if configured
   - uses Ollama for nightly synthesis

## Suggested event shape

```json
{
  "agent": "CashClaw",
  "action": "daily_report",
  "status": "completed",
  "summary": "Daily business report generated.",
  "source": "/api/agent",
  "details": {
    "date": "2026-06-01",
    "responsePreview": "..."
  }
}
```

## Midnight jobs

- merge all agent events from the day
- write the daily note
- generate a business report
- flag open risks
- list follow-ups for the next day

## Good automations

- order spikes -> notify ops + create follow-up task
- failed webhook -> log event + retry queue + escalation
- repeat customer queries -> promote to FAQ/playbook
- inventory threshold breach -> generate reorder recommendation
- deploy success/failure -> write deployment note
- repeated agent failure -> escalate to reviewer
