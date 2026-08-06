import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { JsonGraphNodeData } from "./build-json-graph";

type JsonGraphNode = Node<JsonGraphNodeData, "jsonNode">;

function JsonNode({ data }: NodeProps<JsonGraphNode>) {
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
