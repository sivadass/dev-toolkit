import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PdfCompressorPage } from "./pdf-compressor-page";

vi.mock("./use-pdf-compressor", () => ({
  usePdfCompressor: () => ({
    file: null,
    setFilesFromControl: vi.fn(),
    mode: "auto",
    setMode: vi.fn(),
    presetId: "balanced",
    setPresetId: vi.fn(),
    pageCount: null,
    classification: null,
    warning: null,
    error: null,
    isCompressing: false,
    isInspecting: false,
    progress: null,
    result: null,
    compress: vi.fn(),
    cancel: vi.fn(),
  }),
}));

describe("PdfCompressorPage", () => {
  it("renders title and disabled compress action without a file", () => {
    render(<PdfCompressorPage />);
    expect(screen.getByText("PDF compressor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compress/i })).toBeDisabled();
  });
});
