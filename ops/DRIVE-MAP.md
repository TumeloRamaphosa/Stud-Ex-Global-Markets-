# StudEx live Drive map

Verified 2026-10-01 against Drive owned by **agentcyberpunk7@gmail.com**.
These 18 folder IDs are the live command centers. Do not invent a 19th hub.
Duplicate folders exist from old syncs — only the IDs in this file are live.

**Rules (from `NOTION_COMMAND_CENTER.md`):** no secrets in Drive (keys live in Base44 or the restricted Notion API-keys page); no publish / payment / fulfilment without a human; Manager-of-Agents loop is delegate → agent ships a diff → human decides.

OpenClaw gateway on the MacBook is **`:18789`** (`~/.clawx/openclaw`). After Orgo cutover, stop ClawX so tokens do not race.

---

## How agents should use this Drive

| Need | Live folder | Write here |
| --- | --- | --- |
| Dispatch a job | Agent Bus `tasks/` | One markdown file per job. Inbox was empty at verify time. |
| Ship a result | Agent Bus `results/` | Diffs / logs, no keys. |
| Update fleet roster | Agent Registry + Brain `Agent_Fleet_Status.md` | Newest file wins (Drive keeps stale copies). |
| Daily / mission state | Obsidian Brain (#3) | `Daily_Brief_*.md`, `Mission_Tasks.md`, `Pipeline_Status.md`, `Infrastructure_Status.md`. |
| Client work | Clients (#6) | One subfolder per client. Notion-client mirrors stay under Notion (#2)/Clients. |
| Human board | Tango | https://tango.applayer.io/tasks — Drive is memory, Tango is the work queue. |

Do **not** mirror the whole Drive onto the MacBook. Disk is already tight. Agents read via Google Drive MCP.

---

## Live IDs (canonical)

JSON twin: [`drive-ids.json`](drive-ids.json).

### Core command centers

| # | Hub | Folder ID | Verified children (sample) |
| --- | --- | --- | --- |
| 1 | **Studex Agent Bus** (dispatch) | `1TFDjIVv5UWx-VHCLg-6mj4i6UImIkkWe` | `agent-registry`, `agent-configs`, `runbooks`, `tasks` (empty), `results` |
| 2 | **Notion Command Center** | `1Fp-jYTqv9a90R07Tp_t55vZXjpynaBHT` | `NOTION_COMMAND_CENTER.md` (`17RMHX9K7qCAPemnDfokHKuW13_iasgKQ`), Meetings, Transcripts, Clients, Data, Workspace Pages Mirror, Learning OS, Businesses, StudBot Cohort One |
| 3 | **Obsidian — Studex Brain** (vault sync) | `1vzzTYCpo0hSwHkIF293msDgKtUy6RdlK` | Rolling `Daily_Brief_*`, `Mission_Tasks.md`, `Mission_Contacts.md`, `Agent_Fleet_Status.md`, `Infrastructure_Status.md`, `Pipeline_Status.md`. Newest copies written **2026-10-01 16:05Z**. Older same-name files are stale syncs. |
| 4 | **Base 44 Operating System** | `1djabbphWNXSVaNhbx_V4h81FREWMHfOZ` | Buzz Agency, Big OS!, Jev-Day, Grokina, Builders-Build |
| 5 | **Agent Registry** (fleet roster) | `1a7jcTmgaNs66aoedht-lI1u4vNQPwaNu` | Parent of Notion (#2) and Studex meat (#16). Also: Content, AUTO, My Mobile, Mac Mini Data Room, Mac 1 OpenClaw Adam Smasher, Arcade, SuperAgents, plus a **stale Clients copy** — ignore that copy. |
| 6 | **Clients** (live) | `1_8ab1VK3qdSv-8EnMlbmhaARr3XfRcoA` | IGH, Raws, Straegy, Bohlale, PwC, UAE, Huawei, Bitfury, Dark Factory, Super Agents |
| 7 | **Marketing** | `1_0JERjf8uq-Nr0_B72ta3K_W7jrqtbHU` | Emails, Research, Lead-Data, T4-Models, Campaign-Templates, Claude-SEO, Research-Pipeline, plus OpenClaw prompt/bridge files |

### Other hubs (same Drive)

| # | Hub | Folder ID | Verified children (sample) |
| --- | --- | --- | --- |
| 8 | Obsidian Vault (top level) | `1PzRisVPg7HTvlqtQZ-YwpLIMS20D6eoE` | Agent Fleet, Mission Data, Daily Briefs, Infrastructure, Pipeline |
| 9 | Studex-Operations | `11M3sCRCkOMUxQbJa9bvHcqaKU3a-6YMa` | JARVIS-OS |
| 10 | Kigali Summit 2026 | `1eQW9WPgyQwY_TqJvkZvquF8yOrbgobTK` | Templates, Obsidian-Notes, Archive, Meetings, Exports |
| 11 | Studex Data Room | `1UI-sJTu2zJdxB2brMGPzj3jPsC7UkfHk` | Strategy, Mission Ops, Sales & Partnerships, Marketing Content, Financial Models |
| 12 | Software Factory | `17dttaaf9fXAp3bynDaPf2xXw-0Pvukl8` | Empty at verify (folder exists at shared-drive root `0APNXlQ2YzOL9Uk9PVA`) |
| 13 | Coding Agents | `1tkB2zFIfll6DxcuOG9FQw1s1bDE1WOp-` | Empty at verify (same shared-drive root) |
| 14 | Studex Skills | `1JaQfnTHtSP58R9V9CZNa9c0fMAbyN6A7` | Skill markdown (Context7, Honcho, GitNexus, Graphify, Karpathy wiki, …) |
| 15 | Hermes Notes | `1UMpeygpC7gDmZIUtYjK1PPwnQ40p-6bo` | Hermes Agent Setup.md, Model Manager.md |
| 16 | Studex meat | `1IgG8DF5QBghpaxOUcSZBo5eUKLxl5w0X` | Buyers, UAE-Meat, RFQs, AutoMEat x OpenClaw, Middle East buyer PRD |
| 17 | Global Markets | `1xfsCCLWjWm8gfD5hHhnX_Entaac9ci0y` | Adam-Smasher, UAE, FNMD, China, Russia |
| 18 | Dark Factory | `1Yr1dfanbjzJoFBcy6H1LPUI0hz8ueNKU` | Kimi Dark Factory zip + site photos |

Folder URLs are `https://drive.google.com/drive/folders/<ID>`.

---

## Duplicates — do not use

| Stale copy | Why it is not live |
| --- | --- |
| Registry → Clients `1wQYHCGGwpGMYdC_H6PvpBlzdfmw_Mtxr` | Old sync. Live Clients is **#6**. |
| Registry → Global Markets `1WtaccEdHiDCTce9A3Ik2MoHJX9M71dgc` | Old sync. Live Global Markets is **#17**. |
| Notion → Clients `1e9GZWoeFPQGwnPcSGtYkJ95tXRbK3JKy` | Notion-layer client mirrors only. Commercial folders live in **#6**. |
| Brain vault same-name `.md` files older than 2026-10-01 16:05Z | Katjana sync writes a new file instead of overwriting. Sort by `modifiedTime`. |
| Marketing → Studex-Agent-Bus `1rkNce1omWk-LqxXrDR2rgqA6MnfLgc4s` | Nested copy. Live Agent Bus is **#1**. |
| Clients → Dark Factory `1dF4cI8sqX7xEn7nTuxiIc1hCmvupFxcZ` | Client-side copy. Live Dark Factory hub is **#18**. |

---

## OpenClaw `:18789` wiring

```
Humans / Telegram / Buzz / Tango
        │
        ▼
MacBook ClawX OpenClaw  :18789     ← live until Orgo cutover
  ~/.clawx/openclaw
        │
        ├─ read/write  Agent Bus (#1)  tasks / results / runbooks
        ├─ read        Agent Registry (#5)  fleet roster
        ├─ read        Brain (#3)  newest Daily_Brief / Mission_Tasks
        └─ read        Clients (#6)  one folder per account
        │
        ▼  (after backup-clawx.sh + migrate-to-orgo.sh)
Orgo Super Agents Command  (one 24/7 gateway)
        then STOP ClawX on the MacBook
```

Laptop probe (already on the bare-metal dashboard): `http://127.0.0.1:18789/`.

Hermes on the Mac Mini (OpenRouter + MiniMax) is the orchestrator for coding workers. OpenClaw is the always-on execution agent. Cursor Cloud Agents stay git workers. They share **this Drive**, not a shared Cursor chat.

---

## Snapshot from Brain (2026-10-01, newest files)

Do not treat this snapshot as a task list to execute from git. Source of truth stays in Drive.

- **Mission board is stale.** ~44 tasks, ~40 overdue (Aug 2026 Rwanda / Russia dates). Recommended human action: close everything with deadline before 2026-09-15, open a Q4 board.
- **8 JobQueue items** (emails, lead score, scrape) created 2026-08-22, still pending. Workers `macbook_local` and `hermes_cloud` look disconnected because Paperclip + OpenMausBot have been down ~40 days.
- **Paperclip** `:44783` and **OpenMausBot** `:8799` on `185.209.179.145` — Brain marks both CRITICAL / DOWN. Do not stand up a sixth VM to replace them. Route new always-on work to Mac Mini / existing Orgo / existing GCP.
- **Base44** (`robosca-prime-*.base44.app`) — Brain marks UP. Cloud agents (Katjana, Robusca Prime, Hermes fleet) run here. Secrets stay in Base44, not Drive.
- **Primary fleet (Base44, as of 12:03 SAST):** Katjana, Robusca Prime, OpenClaw, Naledi, Cypher Trace, DenchClaw, CashClaw, Hermes online; Store Agent (WhatsApp) paused; OpenMausBot + Paperclip critical.
- **MiniMax** in the secondary/local registry is marked offline in Brain. Laptop Hermes still needs Token Plan `MINIMAX_API_KEY` via `ops/agent-stack/hermes/apply-local.sh`.

---

## Notion index facts

`NOTION_COMMAND_CENTER.md` (file `17RMHX9K7qCAPemnDfokHKuW13_iasgKQ`):

- Drive folder #2 is the Notion home: meetings, transcripts, workspace-page mirrors, Notion-related client work.
- Live Notion is still source of truth for workspace pages; Drive is the mirror.
- Linked: Notion OS hub, Notion Agent charter, daily check-ins, repo `TumeloRamaphosa/studex-agentic-os`.

---

## Mesh mapping (Drive ↔ machines)

| Runtime | Reads / writes |
| --- | --- |
| OpenClaw `:18789` (MacBook → later Orgo) | Agent Bus, Registry, Brain, Clients, Meat |
| Hermes (Mac Mini, OpenRouter + MiniMax) | Hermes Notes #15, Skills #14, Coding Agents #13, Software Factory #12 |
| Cursor Cloud Agents | This repo + Drive MCP (this map) |
| Orgo Auto-Meat | Meat #16, AutoMEat x OpenClaw |
| Orgo Global Markets | Global Markets #17 + this git repo |
| Orgo Super Agents | Agent Bus #1, Registry #5 |
| GCP factory / command | Software Factory #12, Dark Factory #18 |
| Naledi (Orgo Neledi-CMO) | Marketing #7, Content under Registry |
| Tango | Human approval queue — not a Drive folder |

Full site/Herdr/OpenRouter sequence remains in [`CONNECTION-PLAN.md`](CONNECTION-PLAN.md).
