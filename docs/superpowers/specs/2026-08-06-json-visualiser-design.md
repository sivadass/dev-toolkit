# JSON Visualiser — Design Spec

**Date:** 2026-08-06  
**Status:** Approved for implementation planning  
**Scope:** New client-side tool to visualize JSON as an expand/collapse tree and an interactive graph.

## Goal

Add a **JSON visualiser** tool so users can paste large JSON and inspect it in two ways:

1. **Expand/collapse** — Chrome DevTools console-style object tree
2. **Interactive graph** — horizontal node/edge tree (JSON Crack–style), with pan, zoom, and fit

## Product decisions

| Decision | Choice |
|----------|--------|
| Layout | Split pane: left input/view, right graph always |
| Left pane | Toggle between **Text** (raw JSON) and **Tree** (expand/collapse) |
| Right pane | Interactive graph only |
| v1 scope | Minimal: live parse, tree, graph with pan/zoom/fit, validity status, sample JSON on load |
| Approach | `react-json-view-lite` for tree + `@xyflow/react` + `@dagrejs/dagre` for graph |
| Invalid JSON | Show invalid status; keep last valid tree/graph (no flicker while typing) |
| Privacy | All work stays in the browser; no upload |

## Out of scope (v1)

- Node search
- Format / minify buttons
- File upload / download
- Hex color swatches in nodes
- Path copy on click
- Collapsible graph nodes beyond what layout naturally shows
- Monaco / CodeMirror editor

## UX

```
┌─────────────────────────────────────────────────────────────┐
│ PageHeader: JSON visualiser                                 │
├──────────────────────┬──────────────────────────────────────┤
│ [Text] [Tree]        │  Graph canvas (grid bg)              │
│                      │  nodes + curved edges                │
│ Textarea OR          │  Controls: zoom +/- / fit            │
│ expand/collapse tree │                                      │
├──────────────────────┴──────────────────────────────────────┤
│ Status: Valid ✓  |  Invalid ✗ + short parse error           │
└─────────────────────────────────────────────────────────────┘
```

- Live transform: debounce parse ~200ms on text change
- Default sample JSON (small nested object/array) so both panes are non-empty on first visit

## Architecture

```
jsonText (source of truth)
  → debounced parse
  → { ok, value } | { ok: false, error }
  → if ok: update lastValidValue → tree + buildJsonGraph(value)
  → status bar from latest parse attempt
```

Feature folder: `app/src/features/json-visualiser/`

| File | Responsibility |
|------|----------------|
| `json-visualiser-page.tsx` | Shell, PageHeader, split layout, status |
| `use-json-visualiser.ts` | Text, left mode, parse, last-valid value, graph data |
| `build-json-graph.ts` | Pure: JSON → React Flow nodes/edges + dagre LR layout |
| `json-tree-pane.tsx` | `react-json-view-lite` wrapper |
| `json-graph-pane.tsx` | React Flow canvas + Controls |
| `sample-json.ts` | Default JSON string constant |
| `*.test.ts(x)` | Unit tests for graph builder + page smoke |

## Graph node model

- Walk the value recursively.
- **Object / array nodes:** card showing primitives inline; nested object/array keys summarized (`details: {2 keys}`, `items: [3 items]`) and branched to child nodes with edge labels = property name or array index.
- **Root:** single entry node (or synthetic root if top-level is a primitive).
- Layout: `dagre` with `rankdir: "LR"` (left → right), matching the wireframe.

## Integration

- Registry: `app/src/config/tools.ts` — `id: "json-visualiser"`, `status: "ready"`, icon `account_tree`
- Route: `/tools/json-visualiser` in `app/src/app.tsx` (before `:toolId`)
- Deps: `@xyflow/react`, `@dagrejs/dagre`, `react-json-view-lite`
- Styles: `app/src/styles/app.css` — visualiser split, graph height, tree theme overrides using CleanPlate / brand tokens

## Success criteria

- Home card and sidebar list the tool as Ready
- Pasting valid JSON updates tree and graph after debounce
- Left toggle switches Text ↔ Tree without losing JSON
- Graph supports pan, zoom in/out, and fit view
- Invalid JSON shows Invalid status and preserves last valid visualization
- Unit tests cover `build-json-graph` for object, array, nested, and empty cases
- `npm test` passes in `app/`
