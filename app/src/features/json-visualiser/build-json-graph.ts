import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

export type JsonGraphRow = {
  key: string;
  value: string;
};

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

  let idSequence = 0;
  const nextId = () => `n${idSequence++}`;

  function walk(
    currentValue: unknown,
    label: string,
    parentId: string | null,
    edgeLabel: string | null
  ): string {
    const id = nextId();
    const rows: JsonGraphRow[] = [];

    if (isPlainObject(currentValue)) {
      const keys = Object.keys(currentValue);

      const node: Node<JsonGraphNodeData> = {
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: { label: label || `{${keys.length} keys}`, rows },
      };
      nodes.push(node);

      for (const key of keys) {
        const child = currentValue[key];
        if (isPlainObject(child)) {
          rows.push({ key, value: `{${Object.keys(child).length} keys}` });
          walk(child, key, id, key);
        } else if (Array.isArray(child)) {
          rows.push({ key, value: `[${child.length} items]` });
          walk(child, key, id, key);
        } else {
          rows.push({ key, value: formatPrimitive(child) });
        }
      }
    } else if (Array.isArray(currentValue)) {
      nodes.push({
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: {
          label: label || `[${currentValue.length} items]`,
          rows: [{ key: "", value: `[${currentValue.length} items]` }],
        },
      });

      currentValue.forEach((item, index) => {
        walk(item, String(index), id, String(index));
      });
    } else {
      nodes.push({
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: {
          label: label || "value",
          rows: [{ key: label || "value", value: formatPrimitive(currentValue) }],
        },
      });
    }

    if (parentId && edgeLabel !== null) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        label: edgeLabel,
      });
    }

    return id;
  }

  walk(value, "root", null, null);

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 80 });

  for (const node of nodes) {
    const rowCount = Math.max(node.data.rows.length, 1);
    graph.setNode(node.id, {
      width: NODE_WIDTH,
      height: Math.max(NODE_HEIGHT, 28 + rowCount * 22),
    });
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  for (const node of nodes) {
    const position = graph.node(node.id);
    const width = position?.width ?? NODE_WIDTH;
    const height = position?.height ?? NODE_HEIGHT;

    node.position = {
      x: (position?.x ?? 0) - width / 2,
      y: (position?.y ?? 0) - height / 2,
    };
    node.style = { width };
  }

  return { nodes, edges };
}
