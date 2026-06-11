# BMAD Consulting Skill — Framework & Template

**Version:** 1.0.0
**Last Updated:** 2026-03-25
**Methodology:** Ralph Wiggum Loop → BMAD → Get Shit Done (GSD)

---

## What Is BMAD?

**BMAD (Business-Model-Architecture-Development)** is a structured consulting methodology
that runs BEFORE any code is written. It combines three frameworks:

1. **Ralph Wiggum Loop** — Iterative naive questioning until zero unknowns remain
2. **BMAD Consulting** — Structures answers into an actionable brief
3. **Get Shit Done (GSD)** — Executes the brief with zero scope creep

## When Does BMAD Run?

- **Explicitly invoked** — When the user asks for a BMAD session
- **Auto-triggered by Claude** — When Claude detects a new feature, project, or skill
  that has unclear scope, undefined requirements, or would benefit from structured planning

## The Three Phases

### Phase 1: Ralph Wiggum Loop (Discovery)

Ask naive, obvious, "dumb" questions until every assumption is exposed. No question is too
basic. If an answer creates two new questions, keep going. The loop exits ONLY when:
- All 10 core questions are answered
- Follow-up questions from vague answers are resolved
- Zero items remain marked "unclear"

### Phase 2: BMAD Brief (Structure)

Generate a structured brief from the discovery answers. The brief contains:
- Problem & Opportunity
- Target Users / Personas
- Core Features (prioritized)
- Business Model / Revenue Impact
- Technical Architecture
- Agent Roles & Orchestration
- Data Model
- API Surface
- Risks & Mitigations
- Success Metrics
- Implementation Phases

### Phase 3: GSD Execution (Build)

Once the brief is approved:
- Build phase by phase
- Commit after each meaningful unit of work
- No scope creep beyond what the brief defines
- Update Claudeskills.md when the skill is complete

---

## Core Question Set (10 Minimum)

These are the mandatory questions. Follow-ups are added based on answer quality.

### Block A: Business & Problem (Questions 1-3)

**Q1: What problem are we solving?**
> What specific pain point does this feature/skill address?
> Who experiences this pain and how often?

**Q2: Who is this for?**
> Define the primary user persona(s).
> What is their current workflow without this feature?
> What agents or automated systems will interact with this?

**Q3: What does success look like?**
> Define 2-3 measurable success metrics.
> What is the minimum viable outcome that makes this worth building?

### Block B: Model & Revenue (Questions 4-5)

**Q4: How does this create value?**
> Does this generate revenue, save time, reduce cost, or increase retention?
> Is there a monetization model? (subscription, usage-based, freemium, etc.)

**Q5: What already exists?**
> What competitors or alternatives exist?
> What can we learn from them? What do they get wrong?

### Block C: Architecture & Agents (Questions 6-8)

**Q6: What is the technical scope?**
> Frontend, backend, or both?
> New service or extension of existing?
> What existing skills/services does this depend on?

**Q7: What agents are involved?**
> Which AI agents or automated systems will execute tasks?
> What is the orchestration flow between agents?
> What decisions require human-in-the-loop vs. full automation?
> What data do agents need access to?

**Q8: What are the data requirements?**
> What data is created, read, updated, deleted?
> What external APIs or data sources are needed?
> What are the data privacy/security requirements?

### Block D: Development & Risks (Questions 9-10)

**Q9: What are the constraints and risks?**
> Timeline constraints?
> Technical risks (API limits, performance, security)?
> Dependencies on third-party services?
> What could go wrong that would block or derail this?

**Q10: What is the implementation order?**
> What must be built first (MVP)?
> What can wait for Phase 2+?
> Are there quick wins that deliver value immediately?

### Bonus Questions (Asked When Answers Are Vague)

**Q11: Can you walk me through a specific example?**
> Describe one complete user journey from start to finish.

**Q12: What does this NOT do?**
> Explicitly define scope boundaries.
> What features are out of scope for this build?

**Q13: Who else needs to be involved?**
> Stakeholders, reviewers, approvers?
> Cross-team dependencies?

**Q14: How do we know when we're done?**
> What is the "definition of done" for each phase?
> What tests or validations prove it works?

**Q15: What happens if this fails?**
> Rollback plan?
> Impact on existing features?

---

## BMAD Brief Template

When generating a brief, use this template:

```markdown
# BMAD Brief: [Feature/Skill Name]

**Date:** [YYYY-MM-DD]
**Status:** Draft | Approved | Building | Complete
**Author:** [Who initiated the BMAD session]

---

## 1. Problem Statement
[2-3 sentences describing the core problem]

## 2. Target Users
| Persona | Description | Primary Need |
|---------|-------------|--------------|
| ... | ... | ... |

## 3. Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| ... | ... | ... |

## 4. Value Proposition
[How this creates value — revenue, efficiency, retention]

## 5. Competitive Landscape
[What exists, what we do differently]

## 6. Core Features (Prioritized)
### P0 — Must Have (MVP)
- [ ] Feature 1
- [ ] Feature 2

### P1 — Should Have (Phase 2)
- [ ] Feature 3

### P2 — Nice to Have (Phase 3)
- [ ] Feature 4

## 7. Agent Architecture
| Agent | Role | Inputs | Outputs | Automation Level |
|-------|------|--------|---------|------------------|
| ... | ... | ... | ... | Full / Human-in-loop |

### Agent Orchestration Flow
[Describe how agents coordinate]

## 8. Technical Architecture
- **Frontend:** [framework, routes]
- **Backend:** [services, functions]
- **Database:** [collections, schema outline]
- **External APIs:** [services, auth methods]
- **Dependencies:** [existing skills this builds on]

## 9. Data Model
[Key collections/tables and their relationships]

## 10. API Surface
[Endpoint list with methods]

## 11. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| ... | ... | ... |

## 12. Implementation Phases
### Phase 1 — MVP (Week X-Y)
- [ ] Task 1
- [ ] Task 2

### Phase 2 — Enhancement (Week X-Y)
- [ ] Task 3

## 13. Scope Boundaries (What This Does NOT Do)
- Explicitly out of scope item 1
- Explicitly out of scope item 2

## 14. Definition of Done
- [ ] All P0 features implemented
- [ ] Tests passing
- [ ] Deployed to staging
- [ ] Claudeskills.md updated

---

*Generated by BMAD Consulting Skill v1.0.0*
*Methodology: Ralph Wiggum Loop → BMAD → GSD*
```

---

## File Storage Convention

All BMAD briefs are stored in:
```
docs/bmad/
├── BMAD-FRAMEWORK.md          ← This file (framework reference)
├── marketing-skill-brief.md   ← Per-project briefs
├── stitch-skill-brief.md
├── [new-skill]-brief.md
└── ...
```

Each brief filename follows: `[kebab-case-name]-brief.md`

---

## Integration with Claudeskills.md

After a BMAD session:
1. Brief is saved to `docs/bmad/[name]-brief.md`
2. A new entry is added to `Claudeskills.md` with status "Planned" or "Building"
3. When GSD completes the build, status is updated to "Implemented"
4. The BMAD brief link is referenced in the skill entry

---

## Ralph Wiggum Loop Rules

1. **No question is too basic.** If it feels obvious, ask it anyway.
2. **Vague answers trigger follow-ups.** "It should be fast" → "Define fast. Under 200ms? Under 2 seconds?"
3. **Assumptions must be stated explicitly.** "I'm assuming X — is that correct?"
4. **The loop continues until the questioner (Claude) has zero unresolved items.**
5. **Document everything.** Every question and answer goes into the brief.

## GSD Rules

1. **Build exactly what the brief says.** No additions, no "while I'm here..." changes.
2. **Commit after each meaningful unit.** Don't batch 10 changes into one commit.
3. **If blocked, surface it immediately.** Don't spin on a problem silently.
4. **Update Claudeskills.md when done.** The skill registry stays current.
5. **Ship > Perfect.** The brief defines "done" — hit that bar and move on.

---

*This framework is a living document. Updates are tracked in version control.*
