import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_PRESET_ID,
  buildDownloadName,
  getSoftWarnMessage,
  validatePdfFile,
  type CompressMode,
  type PdfClassification,
  type QualityPresetId,
} from "./compress-pdf";
import type { WorkerInMessage, WorkerOutMessage } from "./worker-messages";
import { renderPdfPagePreview } from "./render-pdf-preview";

export interface PdfCompressorResult {
  blob: Blob;
  url: string;
  downloadName: string;
  originalBytes: number;
  compressedBytes: number;
  firstPreviewUrl: string | null;
  lastPreviewUrl: string | null;
  pageCount: number;
}

function createWorker(): Worker {
  return new Worker(
    new URL("./pdf-compressor.worker.ts", import.meta.url),
    { type: "module" }
  );
}

export function usePdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressMode>("auto");
  const [presetId, setPresetId] =
    useState<QualityPresetId>(DEFAULT_PRESET_ID);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [classification, setClassification] =
    useState<PdfClassification | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [result, setResult] = useState<PdfCompressorResult | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const resultRef = useRef<PdfCompressorResult | null>(null);
  const activeCompressIdRef = useRef<number | null>(null);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = createWorker();
    }
    return workerRef.current;
  }, []);

  const revokeResult = useCallback((current: PdfCompressorResult | null) => {
    if (!current) return;
    URL.revokeObjectURL(current.url);
    if (current.firstPreviewUrl) URL.revokeObjectURL(current.firstPreviewUrl);
    if (current.lastPreviewUrl) URL.revokeObjectURL(current.lastPreviewUrl);
  }, []);

  const replaceResult = useCallback(
    (next: PdfCompressorResult | null) => {
      revokeResult(resultRef.current);
      resultRef.current = next;
      setResult(next);
    },
    [revokeResult]
  );

  useEffect(() => {
    return () => {
      revokeResult(resultRef.current);
      resultRef.current = null;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [revokeResult]);

  const postToWorker = useCallback(
    (message: WorkerInMessage, transfer?: Transferable[]) => {
      getWorker().postMessage(message, transfer ?? []);
    },
    [getWorker]
  );

  const inspectFile = useCallback(
    async (next: File) => {
      setIsInspecting(true);
      setClassification(null);
      setPageCount(null);
      setWarning(null);
      const requestId = ++requestIdRef.current;
      const buffer = await next.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      await new Promise<void>((resolve) => {
        const worker = getWorker();
        const onMessage = (event: MessageEvent<WorkerOutMessage>) => {
          const msg = event.data;
          if (msg.requestId !== requestId) return;
          if (msg.type === "inspected") {
            setPageCount(msg.pageCount);
            setClassification(msg.classification);
            setWarning(getSoftWarnMessage(next.size, msg.pageCount));
            worker.removeEventListener("message", onMessage);
            resolve();
          } else if (msg.type === "error") {
            setError(msg.message);
            worker.removeEventListener("message", onMessage);
            resolve();
          }
        };
        worker.addEventListener("message", onMessage);
        postToWorker(
          { type: "inspect", requestId, bytes },
          [bytes.buffer]
        );
      });
      setIsInspecting(false);
    },
    [getWorker, postToWorker]
  );

  const setFilesFromControl = useCallback(
    (files: File[]) => {
      setError(null);
      replaceResult(null);
      setProgress(null);

      const next = files[0] ?? null;
      if (!next) {
        setFile(null);
        setPageCount(null);
        setClassification(null);
        setWarning(null);
        return;
      }
      const validationError = validatePdfFile(next);
      if (validationError) {
        setFile(null);
        setPageCount(null);
        setClassification(null);
        setWarning(null);
        setError(validationError);
        return;
      }
      setFile(next);
      void inspectFile(next);
    },
    [inspectFile, replaceResult]
  );

  const cancel = useCallback(() => {
    const id = activeCompressIdRef.current;
    if (id == null) return;
    postToWorker({ type: "cancel", requestId: id });
    setIsCompressing(false);
    setProgress(null);
    setError(null);
  }, [postToWorker]);

  const compress = useCallback(async () => {
    if (!file) return;
    setIsCompressing(true);
    setError(null);
    setProgress(null);
    replaceResult(null);

    const requestId = ++requestIdRef.current;
    activeCompressIdRef.current = requestId;
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    await new Promise<void>((resolve) => {
      const worker = getWorker();
      const onMessage = (event: MessageEvent<WorkerOutMessage>) => {
        const msg = event.data;
        if (msg.requestId !== requestId) return;

        if (msg.type === "classified") {
          if (msg.pageCount > 0) {
            setPageCount(msg.pageCount);
          }
          setClassification(msg.classification);
          return;
        }
        if (msg.type === "progress") {
          setProgress({ current: msg.current, total: msg.total });
          return;
        }
        if (msg.type === "done") {
          void (async () => {
            try {
              const blob = new Blob([msg.bytes.slice()], {
                type: "application/pdf",
              });
              const url = URL.createObjectURL(blob);
              const pages =
                msg.pageCount > 0 ? msg.pageCount : (pageCount ?? 1);
              if (msg.pageCount > 0) {
                setPageCount(msg.pageCount);
              }
              let firstPreviewUrl: string | null = null;
              let lastPreviewUrl: string | null = null;
              try {
                firstPreviewUrl = await renderPdfPagePreview(msg.bytes, 1);
                if (pages > 1) {
                  lastPreviewUrl = await renderPdfPagePreview(msg.bytes, pages);
                }
              } catch {
                // Preview is best-effort
              }
              replaceResult({
                blob,
                url,
                downloadName: buildDownloadName(file.name),
                originalBytes: msg.originalBytes,
                compressedBytes: msg.bytes.byteLength,
                firstPreviewUrl,
                lastPreviewUrl,
                pageCount: pages,
              });
            } finally {
              worker.removeEventListener("message", onMessage);
              activeCompressIdRef.current = null;
              setIsCompressing(false);
              setProgress(null);
              resolve();
            }
          })();
          return;
        }
        if (msg.type === "error") {
          if (msg.message !== "Cancelled.") {
            setError(msg.message);
          }
          replaceResult(null);
          worker.removeEventListener("message", onMessage);
          activeCompressIdRef.current = null;
          setIsCompressing(false);
          setProgress(null);
          resolve();
        }
      };
      worker.addEventListener("message", onMessage);
      postToWorker(
        { type: "compress", requestId, bytes, mode, presetId },
        [bytes.buffer]
      );
    });
  }, [
    file,
    getWorker,
    mode,
    pageCount,
    postToWorker,
    presetId,
    replaceResult,
  ]);

  // Clear result when mode/preset change
  useEffect(() => {
    replaceResult(null);
  }, [mode, presetId, replaceResult]);

  return {
    file,
    setFilesFromControl,
    mode,
    setMode,
    presetId,
    setPresetId,
    pageCount,
    classification,
    warning,
    error,
    isCompressing,
    isInspecting,
    progress,
    result,
    compress,
    cancel,
  };
}
