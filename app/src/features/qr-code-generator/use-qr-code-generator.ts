import { useCallback, useEffect, useRef, useState } from "react";
import { compositeQrLogo } from "./composite-qr-logo";
import {
  generateQrCode,
  type ErrorCorrectionLevel,
  type GenerateQrResult,
} from "./generate-qr-code";

export const LIVE_DEBOUNCE_MS = 120;

export function useQrCodeGenerator() {
  const [content, setContent] = useState("");
  const [size, setSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("M");
  const [foreground, setForeground] = useState("#222222");
  const [background, setBackground] = useState("#ffffff");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [result, setResult] = useState<GenerateQrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const requestIdRef = useRef(0);

  const setLogoFiles = useCallback((files: File[]) => {
    const next = files[0] ?? null;
    setLogoFile(next);
    if (next) {
      setErrorCorrectionLevel((current) =>
        current === "L" || current === "M" ? "H" : current
      );
    }
  }, []);

  useEffect(() => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      requestIdRef.current += 1;
      setResult(null);
      setError(null);
      setIsGenerating(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;
      setIsGenerating(true);
      setError(null);

      void (async () => {
        try {
          let next = await generateQrCode(content, {
            size,
            errorCorrectionLevel,
            foreground,
            background,
          });
          if (logoFile) {
            try {
              const withLogo = await compositeQrLogo(
                next.pngDataUrl,
                next.svgString,
                logoFile,
                next.size
              );
              next = { ...next, ...withLogo };
            } catch (logoErr) {
              if (requestId !== requestIdRef.current) return;
              setError(
                logoErr instanceof Error
                  ? logoErr.message
                  : "Could not load logo image."
              );
            }
          }
          if (requestId !== requestIdRef.current) return;
          setResult(next);
        } catch (err) {
          if (requestId !== requestIdRef.current) return;
          setResult(null);
          setError(
            err instanceof Error ? err.message : "Could not generate QR code."
          );
        } finally {
          if (requestId === requestIdRef.current) {
            setIsGenerating(false);
          }
        }
      })();
    }, LIVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    content,
    size,
    errorCorrectionLevel,
    foreground,
    background,
    logoFile,
  ]);

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
    logoFile,
    setLogoFiles,
    result,
    error,
    isGenerating,
  };
}
