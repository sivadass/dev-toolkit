import { PDFDocument, degrees } from "pdf-lib";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { stripMetadata } from "./pipeline-optimize";
import type { QualityPreset } from "./compress-pdf";
import type { PageLabel } from "./classify-pdf";

export interface RasterizeOptions {
  dpi: number;
  jpegQuality: number;
}

export async function renderPageToJpeg(
  page: PDFPageProxy,
  options: RasterizeOptions
): Promise<{
  jpegBytes: Uint8Array;
  widthPt: number;
  heightPt: number;
  rotation: number;
}> {
  const scale = options.dpi / 72;
  const viewport = page.getViewport({ scale });
  const canvas = new OffscreenCanvas(
    Math.max(1, Math.floor(viewport.width)),
    Math.max(1, Math.floor(viewport.height))
  );
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }

  // pdf.js typings expect HTMLCanvasElement; OffscreenCanvas works in workers.
  await page.render({
    canvas: canvas as unknown as HTMLCanvasElement,
    viewport,
  }).promise;

  const blob = await canvas.convertToBlob({
    type: "image/jpeg",
    quality: options.jpegQuality,
  });
  const buffer = await blob.arrayBuffer();

  canvas.width = 0;
  canvas.height = 0;

  const baseViewport = page.getViewport({ scale: 1 });
  return {
    jpegBytes: new Uint8Array(buffer),
    widthPt: baseViewport.width,
    heightPt: baseViewport.height,
    rotation: page.rotate,
  };
}

async function embedRasterPage(
  outDoc: PDFDocument,
  page: PDFPageProxy,
  options: RasterizeOptions
): Promise<void> {
  const { jpegBytes, widthPt, heightPt, rotation } = await renderPageToJpeg(
    page,
    options
  );
  const image = await outDoc.embedJpg(jpegBytes);
  const pdfPage = outDoc.addPage([widthPt, heightPt]);
  pdfPage.drawImage(image, {
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt,
  });
  if (rotation) {
    pdfPage.setRotation(degrees(rotation));
  }
}

async function copySourcePage(
  outDoc: PDFDocument,
  sourceDoc: PDFDocument,
  pageIndex: number
): Promise<void> {
  const [copied] = await outDoc.copyPages(sourceDoc, [pageIndex]);
  outDoc.addPage(copied);
}

export type ProgressCallback = (current: number, total: number) => void;

/**
 * Rebuild PDF: rasterize selected pages; copy others from the source via pdf-lib.
 * When `pageLabels` is omitted, every page is rasterized.
 */
export async function rebuildPdfWithImagePipeline(
  sourceBytes: Uint8Array,
  pdfJsDoc: PDFDocumentProxy,
  preset: QualityPreset,
  pageLabels: PageLabel[] | null,
  onProgress?: ProgressCallback,
  shouldCancel?: () => boolean
): Promise<Uint8Array> {
  const pageCount = pdfJsDoc.numPages;
  const outDoc = await PDFDocument.create();
  const sourceDoc = await PDFDocument.load(sourceBytes, {
    ignoreEncryption: true,
  });
  const options: RasterizeOptions = {
    dpi: preset.dpi,
    jpegQuality: preset.jpegQuality,
  };

  for (let i = 0; i < pageCount; i++) {
    if (shouldCancel?.()) {
      throw new DOMException("Compression cancelled.", "AbortError");
    }
    const label = pageLabels?.[i];
    const shouldRasterize = !pageLabels || label === "scanned" || label === "mixed";

    if (shouldRasterize) {
      const page = await pdfJsDoc.getPage(i + 1);
      await embedRasterPage(outDoc, page, options);
      page.cleanup();
    } else {
      await copySourcePage(outDoc, sourceDoc, i);
    }

    onProgress?.(i + 1, pageCount);
  }

  stripMetadata(outDoc);
  return outDoc.save({ useObjectStreams: true });
}

/** Rasterize every page (Scanned mode / Auto→scanned). */
export async function compressImageHeavyPdf(
  sourceBytes: Uint8Array,
  pdfJsDoc: PDFDocumentProxy,
  preset: QualityPreset,
  onProgress?: ProgressCallback,
  shouldCancel?: () => boolean
): Promise<Uint8Array> {
  return rebuildPdfWithImagePipeline(
    sourceBytes,
    pdfJsDoc,
    preset,
    null,
    onProgress,
    shouldCancel
  );
}
