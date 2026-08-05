import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_CONTENT_LENGTH,
  buildQrDownloadNames,
  generateQrCode,
  normalizeHexColor,
  validateQrInput,
} from "./generate-qr-code";

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(),
    toString: vi.fn(),
  },
}));

import QRCode from "qrcode";

const validOptions = {
  size: 256,
  errorCorrectionLevel: "M" as const,
  foreground: "#000000",
  background: "#ffffff",
};

describe("normalizeHexColor", () => {
  it("lowercases valid hex colors", () => {
    expect(normalizeHexColor("#AABBCC")).toBe("#aabbcc");
  });
});

describe("validateQrInput", () => {
  it("rejects empty content", () => {
    expect(validateQrInput("   ", validOptions)).toBe(
      "Enter content to encode."
    );
  });

  it("rejects content over the max length", () => {
    const long = "a".repeat(MAX_CONTENT_LENGTH + 1);
    expect(validateQrInput(long, validOptions)).toMatch(/2000 characters/);
  });

  it("rejects size outside range", () => {
    expect(
      validateQrInput("hello", { ...validOptions, size: 64 })
    ).toMatch(/between/);
    expect(
      validateQrInput("hello", { ...validOptions, size: 2048 })
    ).toMatch(/between/);
  });

  it("rejects invalid colors", () => {
    expect(
      validateQrInput("hello", { ...validOptions, foreground: "black" })
    ).toMatch(/Foreground/);
    expect(
      validateQrInput("hello", { ...validOptions, background: "#fff" })
    ).toMatch(/Background/);
  });

  it("rejects matching foreground and background", () => {
    expect(
      validateQrInput("hello", {
        ...validOptions,
        foreground: "#112233",
        background: "#112233",
      })
    ).toMatch(/different/);
  });

  it("accepts valid input", () => {
    expect(validateQrInput("https://example.com", validOptions)).toBeNull();
  });
});

describe("buildQrDownloadNames", () => {
  it("returns png and svg filenames", () => {
    expect(buildQrDownloadNames()).toEqual({
      png: "qr-code.png",
      svg: "qr-code.svg",
    });
  });
});

describe("generateQrCode", () => {
  beforeEach(() => {
    vi.mocked(QRCode.toDataURL).mockReset();
    vi.mocked(QRCode.toString).mockReset();
  });

  it("returns png and svg from the library", async () => {
    vi.mocked(QRCode.toDataURL).mockImplementation(async () =>
      Promise.resolve("data:image/png;base64,abc")
    );
    vi.mocked(QRCode.toString).mockImplementation(async () =>
      Promise.resolve("<svg></svg>")
    );

    const result = await generateQrCode("https://example.com", validOptions);

    expect(result.pngDataUrl).toBe("data:image/png;base64,abc");
    expect(result.svgString).toBe("<svg></svg>");
    expect(result.size).toBe(256);
    expect(result.downloadNamePng).toBe("qr-code.png");
    expect(result.downloadNameSvg).toBe("qr-code.svg");
    expect(QRCode.toDataURL).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({
        width: 256,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#ffffff" },
      })
    );
    expect(QRCode.toString).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({ type: "svg", width: 256 })
    );
  });

  it("throws validation errors before calling the library", async () => {
    await expect(generateQrCode("  ", validOptions)).rejects.toThrow(
      /Enter content/
    );
    expect(QRCode.toDataURL).not.toHaveBeenCalled();
  });

  it("maps capacity errors to a friendly message", async () => {
    vi.mocked(QRCode.toDataURL).mockRejectedValue(
      new Error("The amount of data is too big")
    );
    vi.mocked(QRCode.toString).mockRejectedValue(
      new Error("The amount of data is too big")
    );

    await expect(
      generateQrCode("https://example.com", validOptions)
    ).rejects.toThrow(/too long for the selected error correction/);
  });
});
