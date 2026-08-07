import type { PdfClassification } from "./compress-pdf";

export interface PageStats {
  imageAreaRatio: number;
  textItemCount: number;
}

export type PageLabel = PdfClassification;

export interface ClassifyDocumentResult {
  classification: PdfClassification;
  pageLabels: PageLabel[];
}

export function classifyPage(stats: PageStats): PageLabel {
  if (stats.imageAreaRatio >= 0.8 && stats.textItemCount <= 5) {
    return "scanned";
  }
  if (stats.imageAreaRatio < 0.2 && stats.textItemCount > 20) {
    return "text";
  }
  return "mixed";
}

export function classifyDocument(pages: PageStats[]): ClassifyDocumentResult {
  if (pages.length === 0) {
    return { classification: "mixed", pageLabels: [] };
  }
  const pageLabels = pages.map(classifyPage);
  const allScanned = pageLabels.every((l) => l === "scanned");
  const allText = pageLabels.every((l) => l === "text");
  if (allScanned) {
    return { classification: "scanned", pageLabels };
  }
  if (allText) {
    return { classification: "text", pageLabels };
  }
  return { classification: "mixed", pageLabels };
}
