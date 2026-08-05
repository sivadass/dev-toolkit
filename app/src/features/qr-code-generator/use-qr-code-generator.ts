import { useCallback, useState } from "react";
import {
  generateQrCode,
  type ErrorCorrectionLevel,
  type GenerateQrResult,
} from "./generate-qr-code";

export function useQrCodeGenerator() {
  const [content, setContent] = useState("");
  const [size, setSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("M");
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [result, setResult] = useState<GenerateQrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = content.trim().length > 0;

  const generate = useCallback(async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const next = await generateQrCode(content, {
        size,
        errorCorrectionLevel,
        foreground,
        background,
      });
      setResult(next);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Could not generate QR code.");
    } finally {
      setIsGenerating(false);
    }
  }, [content, size, errorCorrectionLevel, foreground, background]);

  return {
    content,
    setContent,
    size,
    setSize,
    errorCorrectionLevel,
    setErrorCorrectionLevel,
    foreground,
    setForeground,
    background,
    setBackground,
    result,
    error,
    isGenerating,
    canGenerate,
    generate,
  };
}
