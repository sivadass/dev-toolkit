# JSON Visualiser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side JSON visualiser tool with a split pane — left toggles raw text vs expand/collapse tree, right shows an interactive horizontal graph — registered and routed like existing tools.

**Architecture:** One JSON string is the source of truth. Debounced parse updates a last-valid value used by `react-json-view-lite` (tree) and a pure `buildJsonGraph` → `@xyflow/react` + dagre LR layout (graph). Invalid parses update status only and keep the last valid visualization.

**Tech Stack:** React 19, TypeScript, Vite, CleanPlate, `@xyflow/react`, `@dagrejs/dagre`, `react-json-view-lite`, Vitest. Spec: [`docs/superpowers/specs/2026-08-06-json-visualiser-design.md`](../specs/2026-08-06-json-visualiser-design.md).

## Global Constraints

- Filenames: **kebab-case** only (repo Cursor rule); exported components may be PascalCase
- Prefer CleanPlate props for layout/spacing; read `node_modules/cleanplate/llms.txt` / relevant `docs/*.md` before inventing props
- All processing **client-side only** — no network upload of JSON
- v1 **out of scope:** node search, format/minify, file upload/download, hex color swatches, path copy
- Invalid JSON: show invalid status; **keep last valid** tree/graph
- Debounce parse ~**200ms**
- Follow feature slice pattern of `app/src/features/json-comparer/`

---

## File map

| File | Responsibility |
|------|----------------|
| `app/package.json` / `package-lock.json` | Add graph + tree deps |
| `app/src/config/tools.ts` | Register tool |
| `app/src/config/tools.test.ts` | Assert registry |
| `app/src/app.tsx` | Ready route |
| `app/src/features/json-visualiser/sample-json.ts` | Default JSON string |
| `app/src/features/json-visualiser/build-json-graph.ts` | Pure JSON → nodes/edges + layout |
| `app/src/features/json-visualiser/build-json-graph.test.ts` | Graph builder tests |
| `app/src/features/json-visualiser/use-json-visualiser.ts` | State + debounce parse |
| `app/src/features/json-visualiser/json-tree-pane.tsx` | Tree viewer wrapper |
| `app/src/features/json-visualiser/json-graph-pane.tsx` | React Flow canvas |
| `app/src/features/json-visualiser/json-visualiser-page.tsx` | Page UI |
| `app/src/features/json-visualiser/json-visualiser-page.test.tsx` | Page smoke tests |
| `app/src/styles/app.css` | Split / canvas / tree styles |

---

### Task 1: Install dependencies

**Files:**
- Modify: `app/package.json`
- Modify: `app/package-lock.json`

**Interfaces:**
- Consumes: none
- Produces: `@xyflow/react`, `@dagrejs/dagre`, `react-json-view-lite` installed

- [ ] **Step 1: Install packages**

```bash
cd app && npm install @xyflow/react @dagrejs/dagre react-json-view-lite
```

Also install types if needed (dagre often needs `@types/dagre`):

```bash
cd app && npm install -D @types/dagre
```

Expected: packages listed in `dependencies` (and `@types/dagre` in `devDependencies`); install succeeds.

- [ ] **Step 2: Commit**

```bash
git add app/package.json app/package-lock.json
git commit -m "$(cat <<'EOF'
chore(app): add json visualiser dependencies

EOF
)"
```

---

### Task 2: Register tool and route stub

**Files:**
- Modify: `app/src/config/tools.ts`
- Modify: `app/src/config/tools.test.ts`
- Modify: `app/src/app.tsx`
- Create: `app/src/features/json-visualiser/json-visualiser-page.tsx`
- Create: `app/src/features/json-visualiser/json-visualiser-page.test.tsx`

**Interfaces:**
- Consumes: existing `ToolDefinition` / route patterns
- Produces: tool `json-visualiser` ready; route `/tools/json-visualiser`; stub page with title

- [ ] **Step 1: Update registry test (fail first)**

In `app/src/config/tools.test.ts`, change the length assertion and add status check:

```ts
it("lists seven tools with image compressor, QR tools, JSON comparer, and JSON visualiser ready", () => {
  expect(TOOLS).toHaveLength(7);
  expect(getToolById("image-compressor")?.status).toBe("ready");
  expect(getToolById("qr-code-generator")?.status).toBe("ready");
  expect(getToolById("qr-decoder")?.status).toBe("ready");
  expect(getToolById("json-comparer")?.status).toBe("ready");
  expect(getToolById("json-visualiser")?.status).toBe("ready");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd app && npx vitest run src/config/tools.test.ts
```

Expected: FAIL — length 6 or `json-visualiser` undefined.

- [ ] **Step 3: Add tool entry**

In `app/src/config/tools.ts`, insert after `json-comparer` (before `text-comparer`):

```ts
{
  id: "json-visualiser",
  title: "JSON visualiser",
  description: "Explore JSON as tree and graph",
  icon: "account_tree",
  path: "/tools/json-visualiser",
  status: "ready",
},
```

- [ ] **Step 4: Create stub page**

`app/src/features/json-visualiser/json-visualiser-page.tsx`:

```tsx
import { PageHeader, Typography } from "cleanplate";

export function JsonVisualiserPage() {
  return (
    <div>
      <PageHeader
        title="JSON visualiser"
        subtitle="Inspect JSON as an expandable tree or interactive graph — all in your browser."
      />
      <Typography variant="p" margin="t-4">
        Coming online…
      </Typography>
    </div>
  );
}
```

- [ ] **Step 5: Wire route**

In `app/src/app.tsx`, import and add **before** `:toolId`:

```tsx
import { JsonVisualiserPage } from "./features/json-visualiser/json-visualiser-page";
// ...
<Route path="json-visualiser" element={<JsonVisualiserPage />} />
```

- [ ] **Step 6: Page smoke test**

`app/src/features/json-visualiser/json-visualiser-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonVisualiserPage } from "./json-visualiser-page";

describe("JsonVisualiserPage", () => {
  it("renders title", () => {
    render(<JsonVisualiserPage />);
    expect(screen.getByText("JSON visualiser")).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run tests**

```bash
cd app && npx vitest run src/config/tools.test.ts src/features/json-visualiser/json-visualiser-page.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/src/config/tools.ts app/src/config/tools.test.ts app/src/app.tsx \
  app/src/features/json-visualiser/json-visualiser-page.tsx \
  app/src/features/json-visualiser/json-visualiser-page.test.tsx
git commit -m "$(cat <<'EOF'
feat(app): register JSON visualiser tool route

EOF
)"
```

---

### Task 3: Sample JSON + `buildJsonGraph` (TDD)

**Files:**
- Create: `app/src/features/json-visualiser/sample-json.ts`
- Create: `app/src/features/json-visualiser/build-json-graph.ts`
- Create: `app/src/features/json-visualiser/build-json-graph.test.ts`

**Interfaces:**
- Consumes: parsed `unknown` JSON value
- Produces:
  - `SAMPLE_JSON: string`
  - `buildJsonGraph(value: unknown): { nodes: Node[]; edges: Edge[] }` where `Node`/`Edge` are `@xyflow/react` types
  - Node `data`: `{ label: string; rows: { key: string; value: string }[] }`
  - Edges labeled with property name or array index string

- [ ] **Step 1: Write failing tests**

`app/src/features/json-visualiser/build-json-graph.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildJsonGraph } from "./build-json-graph";

describe("buildJsonGraph", () => {
  it("builds a single node for a flat object of primitives", () => {
    const { nodes, edges } = buildJsonGraph({ name: "Apple", calories: 52 });
    expect(nodes.length).toBe(1);
    expect(edges.length).toBe(0);
    expect(nodes[0].data.rows).toEqual(
      expect.arrayContaining([
        { key: "name", value: "Apple" },
        { key: "calories", value: "52" },
      ])
    );
  });

  it("branches nested objects into child nodes with labeled edges", () => {
    const { nodes, edges } = buildJsonGraph({
      name: "Apple",
      details: { type: "pome", season: "fall" },
    });
    expect(nodes.length).toBe(2);
    expect(edges.length).toBe(1);
    expect(edges[0].label).toBe("details");
    const child = nodes.find((n) => n.id !== nodes[0].id);
    expect(child?.data.rows).toEqual(
      expect.arrayContaining([
        { key: "type", value: "pome" },
        { key: "season", value: "fall" },
      ])
    );
  });

  it("represents arrays with item count and one child per element", () => {
    const { nodes, edges } = buildJsonGraph({ fruits: ["a", "b"] });
    // root object node + 2 array element nodes (primitives become child cards)
    expect(nodes.length).toBeGreaterThanOrEqual(2);
    expect(edges.some((e) => e.label === "fruits")).toBe(true);
  });

  it("handles empty object and empty array", () => {
    expect(buildJsonGraph({}).nodes.length).toBe(1);
    expect(buildJsonGraph([]).nodes.length).toBe(1);
  });

  it("assigns positions via dagre (nodes have numeric x/y)", () => {
    const { nodes } = buildJsonGraph({ a: { b: 1 } });
    for (const n of nodes) {
      expect(typeof n.position.x).toBe("number");
      expect(typeof n.position.y).toBe("number");
    }
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd app && npx vitest run src/features/json-visualiser/build-json-graph.test.ts
```

Expected: FAIL — module not found / `buildJsonGraph` undefined.

- [ ] **Step 3: Add sample JSON**

`app/src/features/json-visualiser/sample-json.ts`:

```ts
export const SAMPLE_JSON = `{
  "fruits": [
    {
      "name": "Apple",
      "color": "#FF0000",
      "details": { "type": "pome", "season": "fall" },
      "nutrients": { "calories": 52, "fiber": "2.4g", "vitaminC": "4.6mg" }
    },
    {
      "name": "Banana",
      "color": "#FFFF00",
      "details": { "type": "berry", "season": "year-round" },
      "nutrients": { "calories": 89, "fiber": "2.6g", "vitaminC": "8.7mg" }
    },
    {
      "name": "Orange",
      "color": "#FFA500",
      "details": { "type": "citrus", "season": "winter" },
      "nutrients": { "calories": 47, "fiber": "2.4g", "vitaminC": "53.2mg" }
    }
  ]
}`;
```

- [ ] **Step 4: Implement `buildJsonGraph`**

`app/src/features/json-visualiser/build-json-graph.ts` — implement approximately:

```ts
import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

export type JsonGraphRow = { key: string; value: string };
export type JsonGraphNodeData = {
  label: string;
  rows: JsonGraphRow[];
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

function formatPrimitive(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  return String(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function buildJsonGraph(value: unknown): {
  nodes: Node<JsonGraphNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<JsonGraphNodeData>[] = [];
  const edges: Edge[] = [];
  let idSeq = 0;
  const nextId = () => `n${idSeq++}`;

  function walk(
    val: unknown,
    label: string,
    parentId: string | null,
    edgeLabel: string | null
  ): string {
    const id = nextId();
    const rows: JsonGraphRow[] = [];

    if (isPlainObject(val)) {
      const keys = Object.keys(val);
      for (const key of keys) {
        const child = val[key];
        if (isPlainObject(child) || Array.isArray(child)) {
          rows.push({
            key,
            value: Array.isArray(child)
              ? `[${child.length} items]`
              : `{${Object.keys(child).length} keys}`,
          });
          walk(child, key, id, key);
        } else {
          rows.push({ key, value: formatPrimitive(child) });
        }
      }
      nodes.push({
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: {
          label: label || `{${keys.length} keys}`,
          rows,
        },
      });
    } else if (Array.isArray(val)) {
      nodes.push({
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: {
          label: label || `[${val.length} items]`,
          rows: [{ key: "", value: `[${val.length} items]` }],
        },
      });
      val.forEach((item, index) => {
        walk(item, String(index), id, String(index));
      });
    } else {
      nodes.push({
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: {
          label: label || "value",
          rows: [{ key: label || "value", value: formatPrimitive(val) }],
        },
      });
    }

    if (parentId && edgeLabel !== null) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        label: edgeLabel,
        type: "default",
      });
    }

    return id;
  }

  walk(value, "root", null, null);

  // dagre LR layout
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 80 });

  for (const node of nodes) {
    const rowCount = Math.max(node.data.rows.length, 1);
    g.setNode(node.id, {
      width: NODE_WIDTH,
      height: Math.max(NODE_HEIGHT, 28 + rowCount * 22),
    });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }
  dagre.layout(g);

  for (const node of nodes) {
    const pos = g.node(node.id);
    const height = pos.height ?? NODE_HEIGHT;
    const width = pos.width ?? NODE_WIDTH;
    node.position = {
      x: pos.x - width / 2,
      y: pos.y - height / 2,
    };
    node.style = { width };
  }

  return { nodes, edges };
}
```

Adjust the array-of-primitives case so tests pass (e.g. for `{ fruits: ["a","b"] }`, root has summary row + two child nodes). Prefer matching test expectations over the sketch above if they conflict.

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd app && npx vitest run src/features/json-visualiser/build-json-graph.test.ts
```

Expected: PASS. Fix implementation until green.

- [ ] **Step 6: Commit**

```bash
git add app/src/features/json-visualiser/sample-json.ts \
  app/src/features/json-visualiser/build-json-graph.ts \
  app/src/features/json-visualiser/build-json-graph.test.ts
git commit -m "$(cat <<'EOF'
feat(app): add JSON graph builder for visualiser

EOF
)"
```

---

### Task 4: Hook — parse, debounce, last-valid

**Files:**
- Create: `app/src/features/json-visualiser/use-json-visualiser.ts`

**Interfaces:**
- Consumes: `SAMPLE_JSON`, `buildJsonGraph`
- Produces: `useJsonVisualiser()` returning:

```ts
{
  jsonText: string;
  setJsonText: (value: string) => void;
  leftMode: "text" | "tree";
  setLeftMode: (mode: "text" | "tree") => void;
  isValid: boolean;
  parseError: string | null;
  parsedValue: unknown | null; // last valid
  nodes: Node<JsonGraphNodeData>[];
  edges: Edge[];
}
```

- [ ] **Step 1: Implement hook**

```ts
import { useEffect, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import {
  buildJsonGraph,
  type JsonGraphNodeData,
} from "./build-json-graph";
import { SAMPLE_JSON } from "./sample-json";

const DEBOUNCE_MS = 200;

function tryParse(text: string):
  | { ok: true; value: unknown }
  | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid JSON",
    };
  }
}

export function useJsonVisualiser() {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [leftMode, setLeftMode] = useState<"text" | "tree">("text");
  const [isValid, setIsValid] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedValue, setParsedValue] = useState<unknown>(() =>
    JSON.parse(SAMPLE_JSON)
  );
  const [nodes, setNodes] = useState<Node<JsonGraphNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const initial = buildJsonGraph(JSON.parse(SAMPLE_JSON));
    setNodes(initial.nodes);
    setEdges(initial.edges);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const result = tryParse(jsonText);
      if (result.ok) {
        setIsValid(true);
        setParseError(null);
        setParsedValue(result.value);
        const graph = buildJsonGraph(result.value);
        setNodes(graph.nodes);
        setEdges(graph.edges);
      } else {
        setIsValid(false);
        setParseError(result.error);
        // keep parsedValue / nodes / edges
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [jsonText]);

  return {
    jsonText,
    setJsonText,
    leftMode,
    setLeftMode,
    isValid,
    parseError,
    parsedValue,
    nodes,
    edges,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/features/json-visualiser/use-json-visualiser.ts
git commit -m "$(cat <<'EOF'
feat(app): add json visualiser state hook

EOF
)"
```

---

### Task 5: Tree pane + graph pane + styles

**Files:**
- Create: `app/src/features/json-visualiser/json-tree-pane.tsx`
- Create: `app/src/features/json-visualiser/json-graph-pane.tsx`
- Modify: `app/src/styles/app.css`

**Interfaces:**
- Consumes: `parsedValue`, `nodes`, `edges` from hook
- Produces: presentational components only

- [ ] **Step 1: Tree pane**

```tsx
import { JsonView, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

type JsonTreePaneProps = {
  value: unknown;
};

export function JsonTreePane({ value }: JsonTreePaneProps) {
  if (value === null || value === undefined) {
    return <p className="json-visualiser__empty">No valid JSON to display.</p>;
  }

  return (
    <div className="json-visualiser__tree" data-testid="json-tree-pane">
      <JsonView data={value as object} style={defaultStyles} />
    </div>
  );
}
```

Check `react-json-view-lite` API for your installed version (`data` vs `json` prop) and adjust.

- [ ] **Step 2: Graph pane**

```tsx
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { JsonGraphNodeData } from "./build-json-graph";

function JsonNode({ data }: NodeProps<Node<JsonGraphNodeData>>) {
  return (
    <div className="json-graph-node">
      <div className="json-graph-node__label">{data.label}</div>
      <ul className="json-graph-node__rows">
        {data.rows.map((row) => (
          <li key={`${row.key}-${row.value}`}>
            {row.key ? (
              <>
                <span className="json-graph-node__key">{row.key}:</span>{" "}
                <span className="json-graph-node__value">{row.value}</span>
              </>
            ) : (
              <span className="json-graph-node__value">{row.value}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const nodeTypes = { jsonNode: JsonNode };

type JsonGraphPaneProps = {
  nodes: Node<JsonGraphNodeData>[];
  edges: Edge[];
};

export function JsonGraphPane({ nodes, edges }: JsonGraphPaneProps) {
  return (
    <div className="json-visualiser__graph" data-testid="json-graph-pane">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
```

Omit `MiniMap` in v1 (not in minimal scope). Ensure nodes re-fit when `nodes` change — if needed, call `useReactFlow().fitView()` in a child effect when `nodes` identity changes, or pass `key` derived from a content hash / `nodes.length + edges.length` sparingly (prefer `fitView` on init + Controls fit button).

- [ ] **Step 3: CSS**

Append to `app/src/styles/app.css`:

```css
.json-visualiser {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.json-visualiser__workspace {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  min-height: 28rem;
}

@media (min-width: 900px) {
  .json-visualiser__workspace {
    grid-template-columns: minmax(16rem, 2fr) minmax(20rem, 3fr);
  }
}

.json-visualiser__left,
.json-visualiser__right {
  display: flex;
  flex-direction: column;
  min-height: 24rem;
  border: 1px solid var(--gray-200, #e5e7eb);
  border-radius: var(--radius-medium, 6px);
  background: var(--white, #fff);
  overflow: hidden;
}

.json-visualiser__toolbar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--gray-200, #e5e7eb);
}

.json-visualiser__editor,
.json-visualiser__tree {
  flex: 1;
  overflow: auto;
  padding: var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
}

.json-visualiser__editor textarea {
  width: 100%;
  height: 100%;
  min-height: 20rem;
  border: none;
  resize: vertical;
  font: inherit;
  background: transparent;
}

.json-visualiser__graph {
  flex: 1;
  min-height: 24rem;
}

.json-graph-node {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--gray-300, #d1d5db);
  border-radius: 6px;
  background: #fff;
  font-size: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  box-shadow: 0 1px 2px rgb(0 0 0 / 6%);
}

.json-graph-node__label {
  font-weight: 600;
  margin-bottom: var(--space-1);
  color: var(--primary-brand, #0c0a5d);
}

.json-graph-node__rows {
  list-style: none;
  margin: 0;
  padding: 0;
}

.json-graph-node__key {
  color: var(--gray-600, #4b5563);
}

.json-visualiser__status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--text-muted, #4b5563);
}

.json-visualiser__status--valid {
  color: #15803d;
}

.json-visualiser__status--invalid {
  color: #b91c1c;
}
```

- [ ] **Step 4: Commit**

```bash
git add app/src/features/json-visualiser/json-tree-pane.tsx \
  app/src/features/json-visualiser/json-graph-pane.tsx \
  app/src/styles/app.css
git commit -m "$(cat <<'EOF'
feat(app): add json visualiser tree and graph panes

EOF
)"
```

---

### Task 6: Wire full page UI

**Files:**
- Modify: `app/src/features/json-visualiser/json-visualiser-page.tsx`
- Modify: `app/src/features/json-visualiser/json-visualiser-page.test.tsx`

**Interfaces:**
- Consumes: `useJsonVisualiser`, `JsonTreePane`, `JsonGraphPane`, CleanPlate `PageHeader` / `Button` / `FormControls` / `Icon` / `Typography`
- Produces: complete tool UI

- [ ] **Step 1: Expand page tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { JsonVisualiserPage } from "./json-visualiser-page";

describe("JsonVisualiserPage", () => {
  it("renders title, text mode editor, and graph pane", () => {
    render(<JsonVisualiserPage />);
    expect(screen.getByText("JSON visualiser")).toBeInTheDocument();
    expect(screen.getByTestId("json-graph-pane")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("toggles left pane to tree view", async () => {
    const user = userEvent.setup();
    render(<JsonVisualiserPage />);
    await user.click(screen.getByRole("button", { name: /tree/i }));
    expect(screen.getByTestId("json-tree-pane")).toBeInTheDocument();
  });

  it("shows valid status for sample JSON", () => {
    render(<JsonVisualiserPage />);
    expect(screen.getByText(/valid/i)).toBeInTheDocument();
  });
});
```

If `@testing-library/user-event` is not installed, use `fireEvent.click` instead (already available via Testing Library).

React Flow may need a JSDOM size mock — if tests fail on `clientWidth`, add in the test file:

```ts
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    }),
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd app && npx vitest run src/features/json-visualiser/json-visualiser-page.test.tsx
```

Expected: FAIL — missing test ids / toggle.

- [ ] **Step 3: Implement page**

```tsx
import { Button, FormControls, Icon, PageHeader, Typography } from "cleanplate";
import { JsonGraphPane } from "./json-graph-pane";
import { JsonTreePane } from "./json-tree-pane";
import { useJsonVisualiser } from "./use-json-visualiser";

export function JsonVisualiserPage() {
  const {
    jsonText,
    setJsonText,
    leftMode,
    setLeftMode,
    isValid,
    parseError,
    parsedValue,
    nodes,
    edges,
  } = useJsonVisualiser();

  return (
    <div className="json-visualiser">
      <PageHeader
        title="JSON visualiser"
        subtitle="Inspect JSON as an expandable tree or interactive graph — all in your browser."
      />

      <div className="json-visualiser__workspace">
        <section className="json-visualiser__left" aria-label="JSON input">
          <div className="json-visualiser__toolbar">
            <Button
              variant={leftMode === "text" ? "solid" : "bordered"}
              size="small"
              onClick={() => setLeftMode("text")}
            >
              Text
            </Button>
            <Button
              variant={leftMode === "tree" ? "solid" : "bordered"}
              size="small"
              onClick={() => setLeftMode("tree")}
            >
              Tree
            </Button>
          </div>
          {leftMode === "text" ? (
            <div className="json-visualiser__editor">
              <FormControls.TextArea
                label="JSON"
                hideLabel
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                isFluid
                rows={20}
              />
            </div>
          ) : (
            <JsonTreePane value={parsedValue} />
          )}
        </section>

        <section className="json-visualiser__right" aria-label="JSON graph">
          <JsonGraphPane nodes={nodes} edges={edges} />
        </section>
      </div>

      <div
        className={
          isValid
            ? "json-visualiser__status json-visualiser__status--valid"
            : "json-visualiser__status json-visualiser__status--invalid"
        }
        role="status"
      >
        <Icon
          name={isValid ? "check_circle" : "error"}
          size="small"
          aria-hidden
        />
        <Typography variant="small" margin="0">
          {isValid ? "Valid" : `Invalid${parseError ? `: ${parseError}` : ""}`}
        </Typography>
      </div>
    </div>
  );
}
```

Verify CleanPlate `Button` / `FormControls.TextArea` / `Icon` props against local docs; adjust `variant` names if the installed CleanPlate uses different tokens (`primary` vs `solid`, etc.) — mirror `json-comparer-page.tsx`.

- [ ] **Step 4: Run all visualiser + registry tests**

```bash
cd app && npx vitest run src/config/tools.test.ts src/features/json-visualiser
```

Expected: PASS.

- [ ] **Step 5: Manual check**

```bash
cd app && npm run dev
```

Open `/tools/json-visualiser`: confirm sample graph, Text↔Tree toggle, edit JSON → graph updates, break JSON → Invalid + last graph remains, zoom/fit controls work.

- [ ] **Step 6: Commit**

```bash
git add app/src/features/json-visualiser/json-visualiser-page.tsx \
  app/src/features/json-visualiser/json-visualiser-page.test.tsx
git commit -m "$(cat <<'EOF'
feat(app): ship JSON visualiser page UI

EOF
)"
```

---

## Verification checklist

- [ ] Home card shows **JSON visualiser** as Ready
- [ ] Sidebar navigates to `/tools/json-visualiser`
- [ ] Text ↔ Tree toggle works; graph always visible on the right
- [ ] Debounced live update on edit
- [ ] Invalid JSON shows error; last valid viz kept
- [ ] Pan / zoom / fit on graph
- [ ] `cd app && npm test` passes

## Self-review (plan author)

1. **Spec coverage:** Split layout, left toggle, graph, live parse, last-valid on error, sample data, registry/route, deps, CSS, tests — each has a task.
2. **Placeholders:** None intentional; adjust CleanPlate prop names to match installed docs at implement time.
3. **Types:** `JsonGraphNodeData` / `buildJsonGraph` / hook return shape are consistent across tasks.
