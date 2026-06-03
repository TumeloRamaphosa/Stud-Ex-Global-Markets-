# Reference Repos

External code we study but **do not ship**. Anything here is read-only — fork into your own service if you want to use it.

## polsia-reference/

Clone of [PolsiaAI/Polsia](https://github.com/PolsiaAI/Polsia) (~544 KB, depth=1).

**What it is:** The open-source self-hostable version of Polsia — 10 specialized agents (Orchestrator, Business Planning, Competitor Research, Social Media, Ads, Email Outreach, Customer Support, Code Generation, Finance, Deployment) orchestrated via Celery + Redis, with a FastAPI backend and Next.js dashboard. Each agent calls the Claude Code CLI as a subprocess (no Anthropic API key needed; uses OAuth at `~/.claude`).

**Why we cloned it:**

1. It is the closest public reference architecture to our "Agents as a Service" pitch.
2. We can lift the agent-orchestration patterns into Naledi without paying the 20% rev-share.
3. Useful to dissect for our `/vs-polsia` comparison page.

**Key files to read:**

- `CLAUDE.md` — overall architecture and ops notes
- `backend/app/agents/base_agent.py` — the `call_claude()` subprocess wrapper pattern
- `backend/app/agents/orchestrator/` — how they coordinate the 10 agents
- `celery_app/` — task queue + Beat schedule
- `frontend/src/app/` — dashboard routes (`agents`, `tasks`, `memory`, `social`, `outreach`, `finance`, `ads`, `dashboard`, `settings`)
- `docker-compose.yml` — full stack: nginx, FastAPI, Postgres, Redis, ChromaDB, Celery

**Do not:**

- Run `make up` against production data — `SANDBOX_MODE=true` should always be set in their `.env` during exploration.
- Copy code into our services without rewriting/attribution review (MIT-licensed but verify before shipping).

**What to lift:**

- The 10-agent topology → maps cleanly onto our 5 "Naledi" agents + 5 ops agents
- The Celery Beat schedule pattern for "daily autonomous cycles"
- The ChromaDB persistent-memory layer per company/tenant
- The activity-feed WebSocket pattern for our "live build cam"
