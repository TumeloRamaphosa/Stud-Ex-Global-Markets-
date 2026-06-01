# AGENT-COORDINATION.md
## How the 3 agents + 2 terminals work together (and who owns what)
## Author: Claude Code | Date: 2026-06-01

> Read this first. It assigns lanes so we stop colliding, reconciles the deploy
> target, and defines the merge order. Companion docs: `CLAUDE-MASTER-PLAN.md`
> (Perplexity), `AGENTS.md` (Cursor), `AGENTS-BRIEF.md` + `FULL-BUILD-BRIEF.md` (Claude).

---

## THE TEAM (4 builders + Tumelo)

| Builder | Role | Owns | Brief |
|---------|------|------|-------|
| **Cursor (IDE)** | Polish | Lint/type/build health, UI refinement, lockfiles, Firebase auth scaffold + emulators, payments (Remotion) — cleans up what everyone ships | `AGENTS.md` |
| **Claude terminal** | Full infrastructure | Provision Fly.io VM + Manus VM, `docker-compose` split, ttyd terminals, metrics endpoints, deploy/networking | `FULL-BUILD-BRIEF.md` (Parts 1–4) |
| **GPT** | Agents + debugging | Build/fix CashClaw, Hermes, Meta Ads, n8n; per-agent `/health` `/connections` `/chat`; debug failures | `AGENTS-BRIEF.md` |
| **Claude Code (this session) + Tumelo** | Finalize | Mission Control dashboard integration, `app/api/admin/*`, **auth + security**, final review + ship | `FULL-BUILD-BRIEF.md` (Part 5) |

> Note: git commits authored "Perplexity Computer" are a tool driven by the team —
> that work (store + CashClaw/Charlie API routes) rolls up under **GPT (agents)**
> and **Claude Code (dashboard)** depending on the file. Stay in the lanes below.

---

## RECONCILED DEPLOY MODEL (everyone build for THIS)

Three hosts, each with a clear job — no more Vercel-vs-Fly confusion:

```
VERCEL ............ customer store + Nexus / Mission-Control dashboard
                    (Next.js frontend + API routes, auto-deploys on push)
   │  API routes proxy to ↓
FLY.IO VM (JNB) ... always-on processes that can't be Vercel serverless:
                    CashClaw workers, n8n-runner:3003, mcp-meta-ads:3002, super-agents
MANUS VM (GPU) .... Hermes:3004 + Ollama + ComfyUI (free local image/video generation)
```

- Vercel hosts the **web app** (Perplexity's single-Next.js plan stays valid).
- Long-running / GPU work that Vercel can't do moves to the two VMs.
- The Mission Control dashboard (Claude) renders the **two VM screens** and talks
  to them over their public URLs + ttyd terminals.

---

## LANES (work in parallel, no overlap)

### Cursor (IDE) — Polish
- `firebase-backend/*`, Firebase Auth provider + emulator config (scaffold for Claude's final auth)
- `.env.local.example`, lockfiles, `.eslintrc`, fix lint/type errors that block `next build`
- UI refinement of pages others build; payments (Remotion) → merge when green
- DO NOT touch: business logic of agents (GPT), command-center integration (Claude Code)
- ACTION: merge `cursor/dev-environment-setup-5afa` onto the shared branch so the
  auth scaffold + build fixes are available to everyone.

### Claude terminal — Full infrastructure
- `docker-compose.fly.yml`, `docker-compose.manus.yml` (split per FULL-BUILD-BRIEF Part 1)
- Provision Fly.io VM (JNB, `min_machines_running=1`) + Manus VM (`35.196.24.245`, GPU)
- ttyd terminal services (VM-level + per-container) + `:9100` metrics endpoints
- Networking: public URLs, TLS, secrets plumbing (values come from Tumelo)
- DO NOT touch: dashboard React (Claude Code), agent business logic (GPT)

### GPT — Agents + debugging
- `studex-frontend/app/api/agent` (CashClaw), `hermes-agent/src`, `mcp-meta-ads/src`, `n8n-runner/src`
- `app/api/cashclaw`, `app/api/charlie` (build/debug)
- Implement per-agent contract: `/health`, `/connections`, `/chat`, `/logs`
- Hermes↔CashClaw round-trip; fix runtime errors across all agents
- DO NOT touch: infra/compose (Claude terminal), command-center integration (Claude Code)

### Claude Code (this session) + Tumelo — Finalize
- `app/command-center/page.tsx` → Mission Control (two VM screens)
- `components/VMScreen`, `components/AgentCard`
- `app/api/admin/*` (vms, agents, secrets, context, chat, terminal-url)
- **Final auth + security** over admin/terminal routes; integrate everyone's work; ship

---

## BRANCH + MERGE RULES (stop the push collisions)

1. **One shared integration branch:** `claude/instagram-analytics-prd-qSt5w`.
2. **Before every push:** `git pull --no-edit origin <branch>` then push. (We already
   collided twice today — always pull first.)
3. **Cursor** lands its work via a clean merge of `cursor/*` into the shared branch
   (resolve lint/build conflicts in the merge, not after).
4. **Stay in your lane** (file lists above) → merges stay conflict-free.
5. **Claude integrates last:** auth + security wraps everything before we ship.

---

## SIGNAL PROTOCOL (how we tell each other we're done)
- Write status to `.perplexity-ready/<agent>-status.md`:
  ```
  AGENT: <name>
  DONE: <what landed>
  DEPLOYED: <url or n/a>
  NEXT: <what's blocking / next>
  TOUCHED: <files>   ← so others know what changed
  ```
- Claude reads all three before the final auth/integration pass.

---

## AUTH + SECURITY — Claude + Tumelo, LAST
(Do not let other agents ship these; they land at the end on top of everyone's work.)
- [ ] Reuse Cursor's **Firebase Auth** for user login (store + dashboard).
- [ ] Protect ALL `/api/admin/*` + `/command-center` + ttyd terminal URLs behind auth
      (signed, short-lived tokens for terminals).
- [ ] Move every secret to Vercel env / Fly secrets / Manus `.env`. Nothing in git.
- [ ] **Remove `SHOPIFY_TOKEN.txt` from the repo and rotate that token** (currently leaked).
- [ ] Role check: only Tumelo's account can open terminals / edit API keys.
- [ ] Rate-limit + audit-log the secret-editor and terminal endpoints.

---

## IMMEDIATE NEXT STEPS
1. **Cursor (IDE):** merge `cursor/dev-environment-setup-5afa` into the shared branch; get `next build` green.
2. **Claude terminal:** split compose into `docker-compose.fly.yml` + `docker-compose.manus.yml`; provision both VMs; stand up ttyd + metrics.
3. **GPT:** implement `/health` + `/connections` + `/chat` on every agent; confirm Hermes→CashClaw round-trip.
4. **Claude Code + Tumelo:** build command-center two-VM screens + `app/api/admin/*`; then the auth + security pass last.
5. **All:** pull-before-push; write status files; stay in lane.
