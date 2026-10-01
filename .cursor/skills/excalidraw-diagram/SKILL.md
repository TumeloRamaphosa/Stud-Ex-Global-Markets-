---
name: excalidraw-diagram
description: This skill should be used when the user asks to "create a diagram", "Excalidraw", "flowchart", "mind map", "architecture diagram", "画图", "流程图", "思维导图", or "visualize the agent stack". Generates Obsidian-ready Excalidraw markdown (or .excalidraw JSON) from text.
---

# Excalidraw Diagram Generator

Turn text into an Obsidian-ready Excalidraw file. Save automatically. Do not dump raw JSON into chat.

Based on the public [Obsidian Excalidraw Diagram Generator](https://mcpmarket.com/tools/skills/obsidian-excalidraw-diagram-generator) workflow. Schema details live in `references/excalidraw-schema.md`.

## Workflow

1. Analyze content. Identify concepts, relationships, hierarchy.
2. Choose diagram type (table below).
3. Generate valid Excalidraw JSON.
4. Wrap it in the Obsidian frontmatter below. Do not change that wrapper.
5. Save to disk with Write. Default directory: `ops/command-center/diagrams/` when working in this repo, otherwise the current working directory.
6. Reply with path, diagram type, and how to open it. Do not paste the JSON.

## Filename

`[topic].[type].md` — example: `studex-agent-mesh.flowchart.md`

## Output wrapper (do not modify)

```
---
excalidraw-plugin: parsed
tags: [excalidraw]
---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'

# Excalidraw Data

## Text Elements
%%
## Drawing
```json
{JSON}
```
%%
```

Frontmatter must be `excalidraw-plugin: parsed` and `tags: [excalidraw]`. JSON sits inside `%%` fences. Leave `## Text Elements` empty.

## Diagram types

| Type | File suffix | Use |
| --- | --- | --- |
| Flowchart | flowchart | steps, deploy pipelines, agent handoff |
| Mind map | mindmap | brainstorming |
| Hierarchy | hierarchy | org / system breakdown |
| Relationship | relationship | dependencies |
| Comparison | comparison | two options |
| Timeline | timeline | sequence over time |
| Matrix | matrix | two-axis placement |
| Freeform | freeform | messy notes |

StudEx agent-stack diagrams are almost always **flowchart** or **relationship**.

## Design rules

- `fontFamily: 5` (Excalifont) on every text element
- Replace `"` in labels with `『』` and `()` with `「」`
- Title 24–28px, subtitle 18–20px, body 14–16px, `lineHeight: 1.25`
- Keep elements inside 0–1200 × 0–800
- Colors: title `#1e40af`, connectors `#3b82f6`, body `#374151`, accent `#f59e0b`
- Unique `id` per element, `index` like `a1`, `a2`
- Include `appState.viewBackgroundColor: "#ffffff"` and `files: {}`

## Modes

| Trigger | Output |
| --- | --- |
| Excalidraw, flowchart, mind map | Obsidian `.md` (default) |
| standard excalidraw | `.excalidraw` JSON file |
| animate, Excalidraw animation | `.excalidraw` with animation order |

## After save

Tell the operator:

1. Exact path
2. Why that diagram type
3. Open in Obsidian → More options → Switch to EXCALIDRAW VIEW
4. Optional: also drop a copy next to the command-center HTML if they asked for the dashboards
