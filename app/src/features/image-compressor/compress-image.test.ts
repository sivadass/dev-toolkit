import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { formatBytes } from "../../lib/format-bytes";
import {
  buildDownloadName,
  computeTargetSize,
  compressImage,
  validateImageFile,
  MAX_INPUT_BYTES,
} from "./compress-image";

describe("formatBytes", () => {
  it("formats B KB MB", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});

describe("computeTargetSize", () => {
  it("keeps size when maxDimension is 0", () => {
    expect(computeTargetSize(4000, 3000, 0)).toEqual({ width: 4000, height: 3000 });
  });

  it("scales down longest side and never upscales", () => {
    expect(computeTargetSize(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
    expect(computeTargetSize(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
});

describe("validateImageFile", () => {
  it("rejects oversized files", () => {
    const file = new File([new Uint8Array(MAX_INPUT_BYTES + 1)], "big.png", {
      type: "image/png",
    });
    expect(validateImageFile(file)).toMatch(/10 MB/i);
  });

  it("rejects unsupported types", () => {
    const file = new File(["x"], "x.txt", { type: "text/plain" });
    expect(validateImageFile(file)).toMatch(/unsupported/i);
  });

  it("accepts png under limit", () => {
    const file = new File(["x"], "x.png", { type: "image/png" });
    expect(validateImageFile(file)).toBeNull();
  });
});

describe("buildDownloadName", () => {
  it("uses compressed suffix and extension", () => {
    expect(buildDownloadName("photo.JPEG", "image/webp")).toBe("photo.compressed.webp");
    expect(buildDownloadName("a.png", "image/jpeg")).toBe("a.compressed.jpg");
    expect(buildDownloadName("a.png", "image/png")).toBe("a.compressed.png");
  });
});

describe("compressImage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({
        width: 100,
        height: 50,
        close: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("draws resized bitmap and returns blob", async () => {
    class FakeCanvas {
      width = 0;
      height = 0;
      getContext() {
        return { drawImage: vi.fn() };
      }
      toBlob(callback: BlobCallback, type?: string) {
        callback(new Blob(["fake"], { type: type ?? "image/webp" }));
      }
    }

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") return new FakeCanvas() as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    const file = new File(["x"], "x.png", { type: "image/png" });
    const result = await compressImage(file, {
      quality: 80,
      maxDimension: 50,
      outputType: "image/webp",
    });
    expect(result.width).toBe(50);
    expect(result.height).toBe(25);
    expect(result.mimeType).toBe("image/webp");
    expect(result.blob.type).toBe("image/webp");
  });

  it("passes quality/100 for jpeg", async () => {
    const toBlobCalls: Array<{ type?: string; q?: number }> = [];

    class FakeCanvas {
      width = 0;
      height = 0;
      getContext() {
        return { drawImage: vi.fn() };
      }
      toBlob(callback: BlobCallback, type?: string, quality?: number) {
        toBlobCalls.push({ type, q: quality });
        callback(new Blob(["fake"], { type: type ?? "image/jpeg" }));
      }
    }

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") return new FakeCanvas() as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    const file = new File(["x"], "x.jpg", { type: "image/jpeg" });
    await compressImage(file, {
      quality: 80,
      maxDimension: 0,
      outputType: "image/jpeg",
    });
    expect(toBlobCalls[0]?.type).toBe("image/jpeg");
    expect(toBlobCalls[0]?.q).toBeCloseTo(0.8);
  });

  it("omits quality for png", async () => {
    const toBlobCalls: Array<{ type?: string; args: unknown[] }> = [];

    class FakeCanvas {
      width = 0;
      height = 0;
      getContext() {
        return { drawImage: vi.fn() };
      }
      toBlob(callback: BlobCallback, type?: string, quality?: number) {
        toBlobCalls.push({ type, args: [type, quality] });
        callback(new Blob(["fake"], { type: "image/png" }));
      }
    }

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") return new FakeCanvas() as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    const file = new File(["x"], "x.png", { type: "image/png" });
    await compressImage(file, {
      quality: 80,
      maxDimension: 0,
      outputType: "image/png",
    });
    expect(toBlobCalls[0]?.args[1]).toBeUndefined();
  });
});
