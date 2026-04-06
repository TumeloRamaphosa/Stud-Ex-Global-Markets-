# Claude Code Commands & Skills Reference
## Studex Global Markets Platform
**Version:** 2.0.0 | **Updated:** 2026-04-06

---

## Part 1: Built-in Claude Code Commands

### Session & Navigation
| Command | Description |
|---------|-------------|
| `/help` | Show help and available commands |
| `/clear` | Clear conversation history |
| `/compact` | Compress conversation to save context window |
| `/fast` | Toggle fast mode (same model, faster output) |
| `/quit` or `/exit` | End the Claude Code session |
| `/status` | Show current session status |

### Development Tools
| Command | Description |
|---------|-------------|
| `/init` | Initialize Claude Code in a new project |
| `/commit` | Create a git commit with AI-generated message |
| `/review-pr` | Review a pull request |
| `/simplify` | Review changed code for reuse, quality, and efficiency |

### Configuration
| Command | Description |
|---------|-------------|
| `/config` | View/edit Claude Code configuration |
| `/mcp` | Manage MCP (Model Context Protocol) servers |
| `/permissions` | Manage tool permissions |
| `/keybindings` | Customize keyboard shortcuts |
| `/update-config` | Configure Claude Code settings.json |

### Advanced
| Command | Description |
|---------|-------------|
| `/loop <interval> <command>` | Run a command on recurring interval (e.g., `/loop 5m /commit`) |
| `/schedule` | Create/manage scheduled remote agents on cron |

---

## Part 2: Superpowers Skills (14 Skills)

### Collaboration Skills
| Skill | How to Invoke | What It Does |
|-------|--------------|-------------|
| Brainstorming | `/brainstorm` | Refine ideas through questions before coding |
| Writing Plans | `/write-plan` | Break designs into 2-5 min tasks with file paths |
| Executing Plans | `/execute-plan` | Execute plan tasks systematically |
| Parallel Agents | `superpowers:dispatching-parallel-agents` | Spin up fresh sub-agents per task |
| Subagent Dev | `superpowers:subagent-driven-development` | Coordinate sub-agents with two-stage review |
| Request Review | `superpowers:requesting-code-review` | Review work against the plan |
| Receive Review | `superpowers:receiving-code-review` | Handle incoming review feedback |
| Finish Branch | `superpowers:finishing-a-development-branch` | Verify tests, merge/PR, clean up |

### Testing & Quality Skills
| Skill | How to Invoke | What It Does |
|-------|--------------|-------------|
| TDD | `superpowers:test-driven-development` | Strict RED-GREEN-REFACTOR cycles |
| Debugging | `superpowers:systematic-debugging` | Root cause analysis with evidence |
| Verification | `superpowers:verification-before-completion` | Final checks before declaring done |

### Workflow Skills
| Skill | How to Invoke | What It Does |
|-------|--------------|-------------|
| Git Worktrees | `superpowers:using-git-worktrees` | Create isolated workspaces on new branches |
| Using Superpowers | `superpowers:using-superpowers` | How the agent prioritizes skills |
| Writing Skills | `superpowers:writing-skills` | Guide for creating new skills |

---

## Part 3: DenchClaw Skills (4 Categories)

**Prerequisite:** Run `npx denchclaw@latest` for the web UI at `localhost:3100`

| Skill | How to Invoke | What It Does |
|-------|--------------|-------------|
| CRM | `denchclaw:crm` | Manage contacts, deals, companies via DuckDB with kanban/calendar/timeline views |
| App Builder | `denchclaw:app-builder` | Create sandboxed web apps with React/TSX, bridge API for AI, webhooks, cron |
| Browser | `denchclaw:browser` | Automate Chromium browser with your existing auth state |
| GStack | `denchclaw:gstack` | Sprint workflow: Think → Plan → Build → Review → Test → Ship → Reflect |

### GStack AI Specialist Roles
When you invoke `denchclaw:gstack`, it simulates 18 specialist roles:
- YC Office Hours, CEO/Founder, Eng Manager, Designer, Staff Engineer
- QA Lead, Release Engineer, SRE, and more
- Each role handles its domain automatically — you act as CTO overseeing the AI team

### DenchClaw Sub-Skills
| Sub-skill | Parent | What It Does |
|-----------|--------|-------------|
| `gstack:ship` | GStack | Ship the current sprint |
| `gstack:review` | GStack | Code review phase |
| `gstack:qa` | GStack | Quality assurance testing |
| `gstack:investigate` | GStack | Deep dive investigation |
| `gstack:design-review` | GStack | UI/UX design review |
| `gstack:retro` | GStack | Sprint retrospective |
| `gstack:freeze` / `unfreeze` | GStack | Code freeze management |
| `gstack:canary` | GStack | Canary deployment |
| `gstack:guard` | GStack | Guard rails and checks |
| `gstack:benchmark` | GStack | Performance benchmarks |

---

## Part 4: Claude-Mem Skills (5 Skills)

**Memory is captured automatically.** These skills query it.

| Skill | How to Invoke | What It Does |
|-------|--------------|-------------|
| Memory Search | `/mem-search` | Query past sessions with natural language |
| Do | `claude-mem:do` | Execute memory-aware actions |
| Make Plan | `claude-mem:make-plan` | Create plans informed by historical context |
| Smart Explore | `claude-mem:smart-explore` | Explore codebase with memory-augmented search |
| Timeline Report | `claude-mem:timeline-report` | Generate chronological activity reports |

### Memory Search: Progressive Disclosure
1. **Search** → Returns compact index with IDs (~50-100 tokens)
2. **Timeline** → Chronological context around results
3. **Get_observations** → Full details only for IDs you care about
- Result: **~10x token savings** vs. dumping everything

### Web UI
Access real-time memory stream at `http://localhost:37777`

---

## Part 5: YouTube Transcription & Analysis

| Skill | How to Invoke | What It Does |
|-------|--------------|-------------|
| Transcribe | `/transcribe <URL>` | Transcribe YouTube video or audio file |

### Supported Inputs
- YouTube URLs
- Direct audio files (.m4a, .mp3, .wav)
- VTT subtitle files
- Any yt-dlp supported platform (Vimeo, Twitch, etc.)

### Dependencies Required
```
yt-dlp       — Video downloading
ffmpeg       — Audio extraction
whisper.cpp  — Local speech-to-text (no API key needed)
```

---

## Part 6: MCP Token Optimization

Reference when sessions run slow or costs are high.

### Quick Rules
1. Only enable MCP servers needed for current task
2. Use Read/Grep/Glob instead of Bash for file operations
3. Request specific data, not broad queries
4. Delegate research to sub-agents to protect main context
5. Use progressive disclosure (claude-mem's 3-layer search)
6. Batch related operations into single tool calls

---

## Part 7: Deapi AI Skills Marketplace

Additional AI capabilities from the Deapi skills collection.

| Capability | Description |
|-----------|-------------|
| Transcription | YouTube and audio transcription |
| Image Generation | AI image creation |
| Text-to-Speech | Convert text to audio |
| OCR | Extract text from images |

---

## Part 8: Studex Platform Skills (Custom)

| # | Skill | Status | Category |
|---|-------|--------|----------|
| 1 | Marketing Skill App | Implemented | AI Marketing Automation |
| 2 | Google Stitch Skill | Implementing | Data Integration |
| 3 | Auth & User Management | Implemented | Core Platform |
| 4 | Deal Pipeline | Implemented | Core Platform |
| 5 | Real-Time Messaging | Implemented | Core Platform |
| 6 | KYC Verification | Implemented | Compliance |
| 7 | Analytics & Reporting | Implemented | Marketing Intelligence |
| 8 | Content Generation | Implemented | AI Content Creation |
| 9 | Competitor Research | Planned (Phase 3) | Marketing Intelligence |
| 10 | Hook Performance | Implemented | Marketing Optimization |
| 11 | Multi-Platform Distribution | Implemented | Content Distribution |
| 12 | BMAD Consulting | Implemented | Project Planning |

---

## Quick Reference: Most Used Commands

| Task | Command |
|------|---------|
| Start a new feature | `/brainstorm` → `/write-plan` → `/execute-plan` |
| Debug a problem | `superpowers:systematic-debugging` |
| Search past work | `/mem-search "what did we do with auth?"` |
| Transcribe a video | `/transcribe https://youtube.com/watch?v=...` |
| Manage deals/contacts | `denchclaw:crm` |
| Build internal tool | `denchclaw:app-builder` |
| Run as CTO | `denchclaw:gstack` |
| Optimize slow session | Reference `mcp-token-optimization` |
| Create git commit | `/commit` |
| Review a PR | `/review-pr <number>` |
| Simplify code | `/simplify` |

---

*Generated for Studex Global Markets — All skills installed at `.claude/skills/`*
*Run `git submodule update --init --recursive` after cloning to initialize skill repos.*
