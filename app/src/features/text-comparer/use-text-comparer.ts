import { useCallback, useState } from "react";
import { compareText, type CompareTextResult } from "./compare-text";

export const IDENTICAL_MESSAGE = "No differences — the texts are equal.";

export function useTextComparer() {
  const [left, setLeftState] = useState("");
  const [right, setRightState] = useState("");
  const [result, setResult] = useState<CompareTextResult | null>(null);
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
      setResult(compareText(left, right));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Could not compare text.");
    }
  }, [canCompare, left, right]);

  const swap = useCallback(() => {
    setLeftState(right);
    setRightState(left);
    clearOutput();
  }, [left, right, clearOutput]);

  const clear = useCallback(() => {
    setLeftState("");
    setRightState("");
    clearOutput();
  }, [clearOutput]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    const text = result.identical ? IDENTICAL_MESSAGE : result.unifiedDiff;
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
    swap,
    clear,
    copyResult,
    identicalMessage: IDENTICAL_MESSAGE,
  };
}
