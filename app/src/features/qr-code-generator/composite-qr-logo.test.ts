import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compositeQrLogo, LOGO_ACCEPTED_TYPES } from "./composite-qr-logo";

describe("LOGO_ACCEPTED_TYPES", () => {
  it("includes png jpeg svg webp", () => {
    expect([...LOGO_ACCEPTED_TYPES]).toEqual([
      "image/png",
      "image/jpeg",
      "image/svg+xml",
      "image/webp",
    ]);
  });
});

describe("compositeQrLogo", () => {
  const originalImage = globalThis.Image;
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    class MockImage {
      width = 64;
      height = 64;
      naturalWidth = 64;
      naturalHeight = 64;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal("Image", MockImage);

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") {
        const canvas = originalCreateElement("canvas") as HTMLCanvasElement;
        canvas.width = 0;
        canvas.height = 0;
        vi.spyOn(canvas, "getContext").mockReturnValue({
          drawImage: vi.fn(),
          fillRect: vi.fn(),
          fillStyle: "",
        } as unknown as CanvasRenderingContext2D);
        vi.spyOn(canvas, "toDataURL").mockReturnValue(
          "data:image/png;base64,composited"
        );
        return canvas;
      }
      return originalCreateElement(tag);
    });

    vi.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(
      function (this: FileReader) {
        queueMicrotask(() => {
          Object.defineProperty(this, "result", {
            value: "data:image/png;base64,logo",
            configurable: true,
          });
          this.onload?.({} as ProgressEvent<FileReader>);
        });
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    globalThis.Image = originalImage;
  });

  it("returns a new png data url and svg that embeds the logo", async () => {
    const file = new File(["x"], "logo.png", { type: "image/png" });
    const result = await compositeQrLogo(
      "data:image/png;base64,qr",
      '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"></svg>',
      file,
      256
    );

    expect(result.pngDataUrl).toBe("data:image/png;base64,composited");
    expect(result.svgString).toContain("<image");
    expect(result.svgString).toContain("data:image/png;base64,logo");
    expect(result.svgString).toContain("</svg>");
  });

  it("throws when the logo image fails to load", async () => {
    class FailImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", FailImage);

    const file = new File(["x"], "bad.png", { type: "image/png" });
    await expect(
      compositeQrLogo(
        "data:image/png;base64,qr",
        "<svg xmlns='http://www.w3.org/2000/svg'></svg>",
        file,
        256
      )
    ).rejects.toThrow(/Could not load logo/);
  });
});
