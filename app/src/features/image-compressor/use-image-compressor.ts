import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildDownloadName,
  compressImage,
  type CompressImageResult,
  type OutputMimeType,
  validateImageFile,
} from "./compress-image";

export interface CompressorResult extends CompressImageResult {
  url: string;
  downloadName: string;
}

export function useImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxDimension, setMaxDimension] = useState(1920);
  const [outputType, setOutputType] = useState<OutputMimeType>("image/webp");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CompressorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const resultRef = useRef<CompressorResult | null>(null);

  const revokeResultUrl = useCallback((current: CompressorResult | null) => {
    if (current?.url) URL.revokeObjectURL(current.url);
  }, []);

  const replaceResult = useCallback(
    (next: CompressorResult | null) => {
      revokeResultUrl(resultRef.current);
      resultRef.current = next;
      setResult(next);
    },
    [revokeResultUrl]
  );

  const setFilesFromControl = useCallback(
    (files: File[]) => {
      setError(null);
      replaceResult(null);

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
    },
    [replaceResult]
  );

  useEffect(() => {
    if (!file) {
      setOriginalUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    return () => {
      revokeResultUrl(resultRef.current);
      resultRef.current = null;
    };
  }, [revokeResultUrl]);

  const clearResult = useCallback(() => {
    replaceResult(null);
  }, [replaceResult]);

  const compress = useCallback(async () => {
    if (!file) return;
    setIsCompressing(true);
    setError(null);
    try {
      const compressed = await compressImage(file, {
        quality,
        maxDimension,
        outputType,
      });
      const url = URL.createObjectURL(compressed.blob);
      replaceResult({
        ...compressed,
        url,
        downloadName: buildDownloadName(file.name, compressed.mimeType),
      });
    } catch (err) {
      replaceResult(null);
      setError(err instanceof Error ? err.message : "Compression failed.");
    } finally {
      setIsCompressing(false);
    }
  }, [file, quality, maxDimension, outputType, replaceResult]);

  return {
    file,
    setFilesFromControl,
    quality,
    setQuality,
    maxDimension,
    setMaxDimension,
    outputType,
    setOutputType,
    originalUrl,
    result,
    error,
    isCompressing,
    compress,
    clearResult,
  };
}
