import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { classifyDocument, type PageLabel } from "./classify-pdf";
import {
  DEFAULT_PRESET_ID,
  getPreset,
  type CompressMode,
  type PdfClassification,
  type QualityPresetId,
} from "./compress-pdf";
import { gatherPageStats } from "./gather-page-stats";
import {
  compressImageHeavyPdf,
  rebuildPdfWithImagePipeline,
} from "./pipeline-image";
import { optimizePdf } from "./pipeline-optimize";
import type { WorkerInMessage, WorkerOutMessage } from "./worker-messages";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type { WorkerInMessage, WorkerOutMessage };

let cancelledRequestId: number | null = null;

function post(message: WorkerOutMessage, transfer?: Transferable[]) {
  // In a module worker, `self` is a WorkerGlobalScope; DOM typings treat it as Window.
  (self as unknown as Worker).postMessage(message, transfer ?? []);
}

function isCancelled(requestId: number): boolean {
  return cancelledRequestId === requestId;
}

async function loadPdfJs(bytes: Uint8Array) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  return { pdf, loadingTask };
}

async function classifyBytes(bytes: Uint8Array): Promise<{
  pageCount: number;
  classification: PdfClassification;
  pageLabels: PageLabel[];
}> {
  const { pdf, loadingTask } = await loadPdfJs(bytes);
  try {
    const pageCount = pdf.numPages;
    const sampleCount = pageCount <= 20 ? pageCount : Math.min(pageCount, 8);
    const stats = [];
    for (let i = 1; i <= sampleCount; i++) {
      const page = await pdf.getPage(i);
      stats.push(await gatherPageStats(page));
      page.cleanup();
    }

    const sampleResult = classifyDocument(stats);
    let pageLabels: PageLabel[] = sampleResult.pageLabels;

    if (pageCount > sampleCount) {
      const fill: PageLabel =
        sampleResult.classification === "scanned"
          ? "scanned"
          : sampleResult.classification === "text"
            ? "text"
            : "mixed";
      pageLabels = Array.from({ length: pageCount }, (_, idx) =>
        idx < sampleCount ? sampleResult.pageLabels[idx]! : fill
      );
    }

    const full = classifyDocument(
      pageLabels.map((label) =>
        label === "scanned"
          ? { imageAreaRatio: 0.9, textItemCount: 0 }
          : label === "text"
            ? { imageAreaRatio: 0.05, textItemCount: 50 }
            : { imageAreaRatio: 0.5, textItemCount: 10 }
      )
    );

    return {
      pageCount,
      classification: full.classification,
      pageLabels: full.pageLabels,
    };
  } finally {
    await loadingTask.destroy();
  }
}

function transferBytes(bytes: Uint8Array): {
  bytes: Uint8Array;
  transfer: Transferable[];
} {
  const copy = bytes.slice();
  return { bytes: copy, transfer: [copy.buffer] };
}

async function handleInspect(requestId: number, bytes: Uint8Array) {
  try {
    const { pageCount, classification } = await classifyBytes(bytes);
    post({ type: "inspected", requestId, pageCount, classification });
  } catch (err) {
    post({
      type: "error",
      requestId,
      message: err instanceof Error ? err.message : "Could not read PDF.",
    });
  }
}

async function handleCompress(
  requestId: number,
  bytes: Uint8Array,
  mode: CompressMode,
  presetId: QualityPresetId
) {
  try {
    const preset = getPreset(presetId || DEFAULT_PRESET_ID);
    const originalBytes = bytes.byteLength;
    const onProgress = (current: number, total: number) => {
      if (!isCancelled(requestId)) {
        post({ type: "progress", requestId, current, total });
      }
    };
    const shouldCancel = () => isCancelled(requestId);

    if (mode === "optimize") {
      post({
        type: "classified",
        requestId,
        classification: "text",
        pageCount: 0,
      });
      const out = await optimizePdf(bytes);
      if (shouldCancel()) {
        throw new DOMException("Compression cancelled.", "AbortError");
      }
      const payload = transferBytes(out);
      post(
        {
          type: "done",
          requestId,
          bytes: payload.bytes,
          originalBytes,
          pageCount: 0,
        },
        payload.transfer
      );
      return;
    }

    const classified = await classifyBytes(bytes);
    post({
      type: "classified",
      requestId,
      classification: classified.classification,
      pageCount: classified.pageCount,
    });

    if (shouldCancel()) {
      throw new DOMException("Compression cancelled.", "AbortError");
    }

    let out: Uint8Array;

    if (mode === "scanned" || classified.classification === "scanned") {
      const { pdf, loadingTask } = await loadPdfJs(bytes);
      try {
        out = await compressImageHeavyPdf(
          bytes,
          pdf,
          preset,
          onProgress,
          shouldCancel
        );
      } finally {
        await loadingTask.destroy();
      }
    } else if (classified.classification === "text") {
      out = await optimizePdf(bytes);
    } else {
      const { pdf, loadingTask } = await loadPdfJs(bytes);
      try {
        out = await rebuildPdfWithImagePipeline(
          bytes,
          pdf,
          preset,
          classified.pageLabels,
          onProgress,
          shouldCancel
        );
      } finally {
        await loadingTask.destroy();
      }
    }

    if (shouldCancel()) {
      throw new DOMException("Compression cancelled.", "AbortError");
    }

    const payload = transferBytes(out);
    post(
      {
        type: "done",
        requestId,
        bytes: payload.bytes,
        originalBytes,
        pageCount: classified.pageCount,
      },
      payload.transfer
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      post({ type: "error", requestId, message: "Cancelled." });
      return;
    }
    post({
      type: "error",
      requestId,
      message: err instanceof Error ? err.message : "Compression failed.",
    });
  }
}

self.onmessage = (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data;
  if (msg.type === "cancel") {
    cancelledRequestId = msg.requestId;
    return;
  }
  if (msg.type === "inspect") {
    void handleInspect(msg.requestId, msg.bytes);
    return;
  }
  if (msg.type === "compress") {
    cancelledRequestId = null;
    void handleCompress(msg.requestId, msg.bytes, msg.mode, msg.presetId);
  }
};
