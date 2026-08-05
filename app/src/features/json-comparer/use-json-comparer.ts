import { useCallback, useState } from "react";
import {
  compareJson,
  formatDiffsAsText,
  formatJson,
  type CompareJsonResult,
} from "./compare-json";

const IDENTICAL_MESSAGE = "No differences — the JSON values are equal.";

export function useJsonComparer() {
  const [left, setLeftState] = useState("");
  const [right, setRightState] = useState("");
  const [result, setResult] = useState<CompareJsonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const clearOutput = useCallback(() => {
    setResult(null);
    setError(null);
    setCopyFeedback(null);
  }, []);

  const setLeft = useCallback(
    (value: string) => {
      setLeftState(value);
      clearOutput();
    },
    [clearOutput]
  );

  const setRight = useCallback(
    (value: string) => {
      setRightState(value);
      clearOutput();
    },
    [clearOutput]
  );

  const canCompare = left.trim().length > 0 && right.trim().length > 0;

  const compare = useCallback(() => {
    if (!canCompare) return;
    setError(null);
    setCopyFeedback(null);
    try {
      setResult(compareJson(left, right));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Could not compare JSON.");
    }
  }, [canCompare, left, right]);

  const formatLeft = useCallback(() => {
    setCopyFeedback(null);
    try {
      const formatted = formatJson(left, "Left");
      setLeftState(formatted);
      setResult(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not format Left JSON.");
    }
  }, [left]);

  const formatRight = useCallback(() => {
    setCopyFeedback(null);
    try {
      const formatted = formatJson(right, "Right");
      setRightState(formatted);
      setResult(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not format Right JSON.");
    }
  }, [right]);

  const swap = useCallback(() => {
    setLeftState(right);
    setRightState(left);
    clearOutput();
  }, [left, right, clearOutput]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    const text =
      result.diffs.length === 0 ? IDENTICAL_MESSAGE : formatDiffsAsText(result);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("Copied");
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [result]);

  return {
    left,
    setLeft,
    right,
    setRight,
    result,
    error,
    copyFeedback,
    canCompare,
    compare,
    formatLeft,
    formatRight,
    swap,
    copyResult,
    identicalMessage: IDENTICAL_MESSAGE,
  };
}
