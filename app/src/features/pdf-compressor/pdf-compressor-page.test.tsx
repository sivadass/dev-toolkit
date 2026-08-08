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

  it("renders quiet craft header and compress action with the file step", () => {
    const { container } = render(<PdfCompressorPage />);
    expect(screen.getByText(/client-side/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /pdf compressor/i })
    ).toHaveClass("tool-page-header__title");
    const compress = screen.getByRole("button", { name: /compress/i });
    expect(compress).toBeDisabled();
    expect(container.querySelector(".tool-primary-step")).toContainElement(
      compress
    );
    expect(container.querySelector(".tool-page-header__cta")).toBeNull();
  });
});
