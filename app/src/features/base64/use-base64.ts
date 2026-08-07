import { useCallback, useState } from "react";
import { decodeBase64 } from "./decode-base64";
import { encodeBase64 } from "./encode-base64";

export type Base64Mode = "encode" | "decode";

export function useBase64() {
  const [mode, setModeState] = useState<Base64Mode>("encode");
  const [encodeInput, setEncodeInputState] = useState("");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [decodeInput, setDecodeInputState] = useState("");
  const [decodeOutput, setDecodeOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const clearFeedback = useCallback(() => {
    setError(null);
    setCopyFeedback(null);
  }, []);

  const setMode = useCallback(
    (next: Base64Mode) => {
      setModeState(next);
      clearFeedback();
    },
    [clearFeedback]
  );

  const setEncodeInput = useCallback(
    (value: string) => {
      setEncodeInputState(value);
      setEncodeOutput("");
      clearFeedback();
    },
    [clearFeedback]
  );

  const setDecodeInput = useCallback(
    (value: string) => {
      setDecodeInputState(value);
      setDecodeOutput("");
      clearFeedback();
    },
    [clearFeedback]
  );

  const activeInput = mode === "encode" ? encodeInput : decodeInput;
  const activeOutput = mode === "encode" ? encodeOutput : decodeOutput;
  const canConvert = activeInput.trim().length > 0;

  const convert = useCallback(() => {
    if (!canConvert) return;
    clearFeedback();
    if (mode === "encode") {
      setEncodeOutput(encodeBase64(encodeInput, { urlSafe }));
      return;
    }
    try {
      setDecodeOutput(decodeBase64(decodeInput));
    } catch (err) {
      setDecodeOutput("");
      setError(err instanceof Error ? err.message : "Invalid Base64 input.");
    }
  }, [canConvert, clearFeedback, decodeInput, encodeInput, mode, urlSafe]);

  const clear = useCallback(() => {
    if (mode === "encode") {
      setEncodeInputState("");
      setEncodeOutput("");
    } else {
      setDecodeInputState("");
      setDecodeOutput("");
    }
    clearFeedback();
  }, [clearFeedback, mode]);

  const copyOutput = useCallback(async () => {
    if (!activeOutput) return;
    try {
      await navigator.clipboard.writeText(activeOutput);
      setCopyFeedback("Copied");
      setError(null);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [activeOutput]);

  return {
    mode,
    setMode,
    encodeInput,
    setEncodeInput,
    encodeOutput,
    decodeInput,
    setDecodeInput,
    decodeOutput,
    urlSafe,
    setUrlSafe,
    error,
    copyFeedback,
    canConvert,
    convert,
    clear,
    copyOutput,
    activeInput,
    activeOutput,
  };
}
