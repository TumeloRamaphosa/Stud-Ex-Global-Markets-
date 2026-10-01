# StudEx software factory

Plan for 24/7 coding without burning Cursor Pro on chat. Built from:

- [vercel-labs/eve-software-factory-template](https://github.com/vercel-labs/eve-software-factory-template) (Foreman: classifier → analyst → implementer → reviewer → draft PR)
- [TumeloRamaphosa/Portable-agents](https://github.com/TumeloRamaphosa/Portable-agents) (Mission Control / Black Cloud P1)
- This repo’s Drive map + Hermes/OpenClaw mesh

Do not copy either template into the MacBook. The factory is a **pipeline**, not another always-on VM.

---

## Why Pro still ran out

Cursor Pro is **$20/mo** and includes **two pools**:

| Pool | What it pays for | Typical Pro include |
| --- | --- | --- |
| **Cursor Models** | Grok 4.7 / 4.6 / 4.5, Composer 2.5 | Generous included usage (separate from “Other”) |
| **Other Models** | Claude, GPT, Gemini, etc. at API price | **$20** of third-party spend |

Cloud Agents **draw the same pools**. This Cloud Agent run used **Grok 4.6 high-fast**. Long threads + extra Cloud Agents eat the Cursor Models pool even though you are on Pro. Unused usage does **not** roll over. Your banner said retry **3 Oct 2026, 8:06 PM** — that is the billing-cycle reset, also on [Spending](https://cursor.com/dashboard?tab=spending).

24/7 Cursor Cloud Agents on Pro alone will cap again. Factory rule: **Cursor is a worker, Hermes/OpenClaw is the loop.**

| 24/7 piece | Where | Whose bill |
| --- | --- | --- |
| Dispatcher / classifier / analyst | Hermes on **Mac Mini** (MiniMax Token Plan + local Ollama) | MiniMax / local |
| Messaging | OpenClaw `:18789` → later one Orgo gateway | OpenClaw host |
| Implementer (git + PR) | **One** Cursor Cloud Agent, Composer 2.5 or Grok 4.6 | Cursor Pro pool |
| Reviewer | Different vendor: MiniMax or a second Cursor model only if quota remains | MiniMax first |
| Human merge / pay / fulfil | You | — |

Cap: **1 concurrent Cursor Cloud Agent** on Pro. Queue the rest. When Cursor is capped, Hermes implements and opens the PR itself; do not spawn more Cloud Agents.

To actually run 24/7 at factory volume later: enable on-demand with a hard cap, or Ultra ($200/mo). Until then the MiniMax loop stays up and Cursor only fires when Spending shows headroom (Cloud Agents want ~$2 under the hard limit to start).

---

## Stations (Foreman, mapped to this mesh)

| Station | Eve Foreman | StudEx now | Must not |
| --- | --- | --- | --- |
| Intake | GitHub `factory` label / Linear | Agent Bus `tasks/` + Tango | Secrets in Drive |
| Classifier | Fast model | Hermes MiniMax-M2.7-highspeed | Start Cursor yet |
| Analyst | Plan + acceptance | Hermes MiniMax-M3 → write plan next to the job | Implement |
| Implementer | Coding sandbox + branch | `factory/dispatch-cursor.sh` **or** Hermes git | Merge to main |
| Reviewer | Other vendor, max 2 cycles | Hermes (MiniMax) reads the PR diff | Share implementer chain-of-thought |
| Ship | Draft PR | Human marks ready / merges | Auto-publish, pay, fulfil |

 eve’s own Foreman still deploys as a **separate** Vercel project when `vercel login` exists (`FACTORY_REPO=TumeloRamaphosa/Stud-Ex-Global-Markets-`, label `factory`). Until then the scripts in `ops/agent-stack/factory/` are the line.

Portable-agents Mission Control (`mission-control/index.html`) is the PwC/sovereign **console**, not the coder. Factory PRs feed that console; they do not replace it.

---

## Setup (laptop / Mac Mini)

1. Cursor Dashboard → **API Keys** → create a user key. Put it only in `~/.hermes/.env` as `CURSOR_API_KEY`. Never Drive, never git.
2. Connect GitHub to Cursor (Cloud Agents → repos) for `TumeloRamaphosa/Stud-Ex-Global-Markets-` and later Our-OS / Portable-agents / studex-auto-meat.
3. Spending tab: on-demand **off** until reset if you want a hard stop; or on with a low cap (e.g. $20) after 3 Oct.
4. Hermes: `ops/agent-stack/hermes/apply-local.sh` (MiniMax Token Plan).
5. OpenClaw stays `:18789` until one Orgo cutover.

```bash
# dry run (prints JSON, does not start a Cloud Agent)
ops/agent-stack/factory/dispatch-cursor.sh \
  --repo https://github.com/TumeloRamaphosa/Stud-Ex-Global-Markets- \
  --title "factory: probe" \
  --prompt-file ops/agent-stack/factory/GROK-HANDOFF.md

# actually enqueue — only if Spending shows remaining Cursor-model usage
ops/agent-stack/factory/dispatch-cursor.sh --go --prompt-file /tmp/job.md
```

Default model is **Composer 2.5** (Cursor Models pool). Pass `--model grok-4.6` for Grok workers. Do **not** default to Claude on Pro.

---

## Grok / Hermes handoff

Copy [`ops/agent-stack/factory/GROK-HANDOFF.md`](agent-stack/factory/GROK-HANDOFF.md) into the Grok/Hermes session. That prompt forbids launching Cursor until classifier+analyst are done, packs one implementer prompt, and calls `dispatch-cursor.sh --go`.

Job files go in Drive Agent Bus `tasks/` (folder `1i8XGV3H9bXA8UpPE8DMKIQ5OqLYyuzE2`). Results in `results/`. Software Factory hub (`17dttaaf9fXAp3bynDaPf2xXw-0Pvukl8`) was empty at last verify — do not dump secrets there.

---

## Sequence

1. **Now (Cursor capped until ~3 Oct 20:06):** Hermes MiniMax does classifier/analyst/implementer. No new Cloud Agents.
2. **After reset:** one Cursor implementer at a time via `dispatch-cursor.sh --go`.
3. **When Vercel CLI is logged in:** clone eve template to its own repo, set `FACTORY_REPO`, deploy Foreman. GitHub label `factory` becomes intake.
4. **Mac Mini 24/7:** Hermes + Herdr + this dispatcher. Not a sixth VM. Not a second OpenClaw.
5. **Portable-agents:** keep Mission Control as the human pane; factory draft PRs are the feed.

Human still merges. Human still pays. Human still fulfils.
