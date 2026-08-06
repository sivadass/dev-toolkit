import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

export type JsonValueType =
  | "STR"
  | "INT"
  | "FLOAT"
  | "BOOL"
  | "NULL"
  | "OBJ"
  | "ARR";

export type JsonGraphRow = {
  key: string;
  value: string;
  type: JsonValueType;
  /** When set, a source handle with this id is rendered on the row. */
  childHandleId?: string;
};

export type JsonGraphNodeData = {
  label: string;
  rows: JsonGraphRow[];
};

const NODE_WIDTH = 240;
const NODE_HEIGHT = 80;

export function getJsonValueType(value: unknown): JsonValueType {
  if (value === null) return "NULL";
  if (Array.isArray(value)) return "ARR";
  if (typeof value === "object") return "OBJ";
  if (typeof value === "boolean") return "BOOL";
  if (typeof value === "string") return "STR";
  if (typeof value === "number") {
    return Number.isInteger(value) ? "INT" : "FLOAT";
  }
  return "STR";
}

function formatPrimitive(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  return String(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rowForChild(
  key: string,
  child: unknown
): { row: JsonGraphRow; branches: boolean } {
  if (isPlainObject(child)) {
    return {
      row: {
        key,
        value: `{${Object.keys(child).length} keys}`,
        type: "OBJ",
        childHandleId: key,
      },
      branches: true,
    };
  }

  if (Array.isArray(child)) {
    return {
      row: {
        key,
        value: `[${child.length} items]`,
        type: "ARR",
        childHandleId: key,
      },
      branches: true,
    };
  }

  return {
    row: {
      key,
      value: formatPrimitive(child),
      type: getJsonValueType(child),
    },
    branches: false,
  };
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

      nodes.push({
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: { label: label || `{${keys.length} keys}`, rows },
      });

      for (const key of keys) {
        const child = currentValue[key];
        const { row, branches } = rowForChild(key, child);
        rows.push(row);
        if (branches) {
          walk(child, key, id, key);
        }
      }
    } else if (Array.isArray(currentValue)) {
      nodes.push({
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: {
          label: label || `[${currentValue.length} items]`,
          rows,
        },
      });

      if (currentValue.length === 0) {
        rows.push({
          key: "",
          value: "[0 items]",
          type: "ARR",
        });
      }

      currentValue.forEach((item, index) => {
        const indexKey = String(index);

        if (isPlainObject(item) || Array.isArray(item)) {
          const { row } = rowForChild(indexKey, item);
          rows.push(row);
        } else {
          // Array primitives still branch to leaf nodes; attach the handle to this index row.
          rows.push({
            key: indexKey,
            value: formatPrimitive(item),
            type: getJsonValueType(item),
            childHandleId: indexKey,
          });
        }

        walk(item, indexKey, id, indexKey);
      });
    } else {
      nodes.push({
        id,
        type: "jsonNode",
        position: { x: 0, y: 0 },
        data: {
          label: label || "value",
          rows: [
            {
              key: label || "value",
              value: formatPrimitive(currentValue),
              type: getJsonValueType(currentValue),
            },
          ],
        },
      });
    }

    if (parentId && edgeLabel !== null) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        sourceHandle: edgeLabel,
      });
    }

    return id;
  }

  walk(value, "root", null, null);

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "LR",
    nodesep: 72,
    ranksep: 120,
    edgesep: 40,
  });

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
