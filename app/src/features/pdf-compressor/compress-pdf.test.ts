import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRESET_ID,
  QUALITY_PRESETS,
  WARN_BYTES,
  WARN_PAGES,
  MAX_BYTES,
  buildDownloadName,
  getPreset,
  getSoftWarnMessage,
  validatePdfFile,
} from "./compress-pdf";

describe("QUALITY_PRESETS", () => {
  it("defines high, balanced, and small with expected DPI and quality", () => {
    expect(QUALITY_PRESETS.high).toEqual({ id: "high", label: "High quality", dpi: 200, jpegQuality: 0.8 });
    expect(QUALITY_PRESETS.balanced).toEqual({
      id: "balanced",
      label: "Balanced",
      dpi: 150,
      jpegQuality: 0.6,
    });
    expect(QUALITY_PRESETS.small).toEqual({
      id: "small",
      label: "Small size",
      dpi: 120,
      jpegQuality: 0.4,
    });
    expect(DEFAULT_PRESET_ID).toBe("balanced");
    expect(getPreset("balanced")).toEqual(QUALITY_PRESETS.balanced);
  });
});

describe("validatePdfFile", () => {
  it("rejects non-PDF mime types", () => {
    const file = new File(["x"], "doc.txt", { type: "text/plain" });
    expect(validatePdfFile(file)).toBe(
      "Unsupported file type. Use a PDF file."
    );
  });

  it("accepts application/pdf under the hard size limit", () => {
    const file = new File([new Uint8Array(100)], "scan.pdf", {
      type: "application/pdf",
    });
    expect(validatePdfFile(file)).toBeNull();
  });

  it("rejects files over MAX_BYTES", () => {
    const file = {
      name: "huge.pdf",
      type: "application/pdf",
      size: MAX_BYTES + 1,
    } as File;
    expect(validatePdfFile(file)).toBe(
      "PDF must be 200 MB or smaller."
    );
  });

  it("accepts empty type when filename ends with .pdf", () => {
    const file = new File([new Uint8Array(10)], "scan.pdf", { type: "" });
    expect(validatePdfFile(file)).toBeNull();
  });
});

describe("getSoftWarnMessage", () => {
  it("warns for large byte size", () => {
    expect(getSoftWarnMessage(WARN_BYTES + 1, 10)).toMatch(/may be slow/i);
  });

  it("warns for high page count", () => {
    expect(getSoftWarnMessage(1024, WARN_PAGES + 1)).toMatch(/may be slow/i);
  });

  it("returns null when under thresholds", () => {
    expect(getSoftWarnMessage(1024, 10)).toBeNull();
  });
});

describe("buildDownloadName", () => {
  it("appends .compressed.pdf", () => {
    expect(buildDownloadName("report.pdf")).toBe("report.compressed.pdf");
    expect(buildDownloadName("report.PDF")).toBe("report.compressed.pdf");
    expect(buildDownloadName("noext")).toBe("noext.compressed.pdf");
  });
});
