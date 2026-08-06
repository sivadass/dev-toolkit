import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCEPTED_INPUT_TYPES,
  MAX_INPUT_BYTES,
  decodeQrFromFile,
  validateImageFile,
} from "./decode-qr-code";

vi.mock("jsqr", () => ({
  default: vi.fn(),
}));

import jsQR from "jsqr";

const mockedJsQR = vi.mocked(jsQR);

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

  it("lists expected input types", () => {
    expect(ACCEPTED_INPUT_TYPES).toEqual([
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
    ]);
  });
});

describe("decodeQrFromFile", () => {
  beforeEach(() => {
    mockedJsQR.mockReset();
  });

  it("returns decoded text when jsQR finds a code", async () => {
    const file = new File(["png"], "qr.png", { type: "image/png" });

    const image = {
      width: 2,
      height: 2,
      naturalWidth: 2,
      naturalHeight: 2,
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: "",
    };

    vi.stubGlobal(
      "Image",
      vi.fn(function MockImage(this: typeof image) {
        Object.assign(this, image);
        queueMicrotask(() => {
          this.onload?.();
        });
        return this;
      })
    );

    const getImageData = vi.fn(() => ({
      data: new Uint8ClampedArray(2 * 2 * 4),
      width: 2,
      height: 2,
    }));
    const drawImage = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage, getImageData }),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });

    mockedJsQR.mockReturnValue({
      data: "https://example.com",
      binaryData: [],
      chunks: [],
      version: 1,
      location: {} as never,
    });

    await expect(decodeQrFromFile(file)).resolves.toBe("https://example.com");
    expect(mockedJsQR).toHaveBeenCalled();
  });

  it("throws when no QR code is found", async () => {
    const file = new File(["png"], "empty.png", { type: "image/png" });

    vi.stubGlobal(
      "Image",
      vi.fn(function MockImage(this: {
        onload: (() => void) | null;
        onerror: (() => void) | null;
        src: string;
        width: number;
        height: number;
        naturalWidth: number;
        naturalHeight: number;
      }) {
        this.width = 2;
        this.height = 2;
        this.naturalWidth = 2;
        this.naturalHeight = 2;
        this.onload = null;
        this.onerror = null;
        this.src = "";
        queueMicrotask(() => {
          this.onload?.();
        });
        return this;
      })
    );

    const getImageData = vi.fn(() => ({
      data: new Uint8ClampedArray(2 * 2 * 4),
      width: 2,
      height: 2,
    }));
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: vi.fn(), getImageData }),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });

    mockedJsQR.mockReturnValue(null);

    await expect(decodeQrFromFile(file)).rejects.toThrow(
      /no qr code found/i
    );
  });
});
