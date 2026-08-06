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
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

const INITIAL_VALUE = JSON.parse(SAMPLE_JSON);
const INITIAL_GRAPH = buildJsonGraph(INITIAL_VALUE);

export function useJsonVisualiser() {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [leftMode, setLeftMode] = useState<"text" | "tree">("text");
  const [isValid, setIsValid] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedValue, setParsedValue] = useState<unknown>(INITIAL_VALUE);
  const [nodes, setNodes] = useState<Node<JsonGraphNodeData>[]>(INITIAL_GRAPH.nodes);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_GRAPH.edges);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const result = tryParse(jsonText);
      if (!result.ok) {
        setIsValid(false);
        setParseError(result.error);
        return;
      }

      setIsValid(true);
      setParseError(null);
      setParsedValue(result.value);
      const graph = buildJsonGraph(result.value);
      setNodes(graph.nodes);
      setEdges(graph.edges);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
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
