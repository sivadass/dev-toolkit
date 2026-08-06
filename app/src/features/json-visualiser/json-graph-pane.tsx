import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
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
      <Handle
        type="target"
        position={Position.Left}
        className="json-graph-node__handle json-graph-node__handle--target"
      />
      <div className="json-graph-node__label">{data.label}</div>
      <ul className="json-graph-node__rows">
        {data.rows.map((row) => (
          <li
            key={`${row.key}-${row.value}-${row.type}`}
            className="json-graph-node__row"
          >
            <span className="json-graph-node__row-main">
              {row.key ? (
                <>
                  <span className="json-graph-node__key">{row.key}:</span>{" "}
                  <span className="json-graph-node__value">{row.value}</span>
                </>
              ) : (
                <span className="json-graph-node__value">{row.value}</span>
              )}
            </span>
            <span className="json-graph-node__type" data-type={row.type}>
              {row.type}
            </span>
            {row.childHandleId ? (
              <Handle
                type="source"
                position={Position.Right}
                id={row.childHandleId}
                className="json-graph-node__handle json-graph-node__handle--source"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

const nodeTypes = { jsonNode: JsonNode };

const defaultEdgeOptions = {
  type: "default" as const,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
  },
};

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
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
