import { useCallback, useEffect, useState } from "react";
import { decodeQrFromFile, validateImageFile } from "./decode-qr-code";

export function useQrDecoder() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const setFilesFromControl = useCallback((files: File[]) => {
    setError(null);
    setDecodedText(null);
    setCopyFeedback(null);

    const next = files[0] ?? null;
    if (!next) {
      setFile(null);
      return;
    }
    const validationError = validateImageFile(next);
    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }
    setFile(next);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const decode = useCallback(async () => {
    if (!file) return;
    setIsDecoding(true);
    setError(null);
    setCopyFeedback(null);
    try {
      const text = await decodeQrFromFile(file);
      setDecodedText(text);
    } catch (err) {
      setDecodedText(null);
      setError(err instanceof Error ? err.message : "Could not decode QR code.");
    } finally {
      setIsDecoding(false);
    }
  }, [file]);

  const copyResult = useCallback(async () => {
    if (!decodedText) return;
    try {
      await navigator.clipboard.writeText(decodedText);
      setCopyFeedback("Copied");
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [decodedText]);

  return {
    file,
    setFilesFromControl,
    previewUrl,
    decodedText,
    error,
    isDecoding,
    copyFeedback,
    decode,
    copyResult,
  };
}
