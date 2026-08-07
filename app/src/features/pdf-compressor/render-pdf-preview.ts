import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let configured = false;

export function ensurePdfjsWorker(): void {
  if (configured) return;
  GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  configured = true;
}

/** Render a PDF page to a JPEG object URL for preview thumbnails. */
export async function renderPdfPagePreview(
  bytes: Uint8Array,
  pageNumber: number,
  maxEdge = 240
): Promise<string> {
  ensurePdfjsWorker();
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  try {
    const page = await pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const scale = maxEdge / Math.max(base.width, base.height);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create preview canvas.");
    }
    await page.render({ canvas, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Preview encode failed."))),
        "image/jpeg",
        0.7
      );
    });
    return URL.createObjectURL(blob);
  } finally {
    await loadingTask.destroy();
  }
}
