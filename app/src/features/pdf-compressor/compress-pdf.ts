export const WARN_BYTES = 50 * 1024 * 1024;
export const MAX_BYTES = 200 * 1024 * 1024;
export const WARN_PAGES = 200;

export type CompressMode = "auto" | "scanned" | "optimize";
export type QualityPresetId = "high" | "balanced" | "small";
export type PdfClassification = "scanned" | "text" | "mixed";

export interface QualityPreset {
  id: QualityPresetId;
  label: string;
  dpi: number;
  jpegQuality: number;
}

export const QUALITY_PRESETS: Record<QualityPresetId, QualityPreset> = {
  high: { id: "high", label: "High quality", dpi: 200, jpegQuality: 0.8 },
  balanced: { id: "balanced", label: "Balanced", dpi: 150, jpegQuality: 0.6 },
  small: { id: "small", label: "Small size", dpi: 120, jpegQuality: 0.4 },
};

export const DEFAULT_PRESET_ID: QualityPresetId = "balanced";

export function getPreset(id: QualityPresetId): QualityPreset {
  return QUALITY_PRESETS[id] ?? QUALITY_PRESETS.balanced;
}

export function validatePdfFile(file: File): string | null {
  if (file.size > MAX_BYTES) {
    return "PDF must be 200 MB or smaller.";
  }
  const looksLikePdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!looksLikePdf) {
    return "Unsupported file type. Use a PDF file.";
  }
  return null;
}

export function getSoftWarnMessage(
  byteSize: number,
  pageCount: number
): string | null {
  if (byteSize > WARN_BYTES || pageCount > WARN_PAGES) {
    return "Large PDFs may be slow in-browser. Files over 200 MB are not supported.";
  }
  return null;
}

export function buildDownloadName(originalName: string): string {
  const base = originalName.replace(/\.pdf$/i, "") || "document";
  return `${base}.compressed.pdf`;
}
