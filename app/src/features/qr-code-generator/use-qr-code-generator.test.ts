import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LIVE_DEBOUNCE_MS, useQrCodeGenerator } from "./use-qr-code-generator";

vi.mock("./generate-qr-code", async () => {
  const actual = await vi.importActual<typeof import("./generate-qr-code")>(
    "./generate-qr-code"
  );

  return {
    ...actual,
    generateQrCode: vi.fn(),
  };
});

vi.mock("./composite-qr-logo", () => ({
  compositeQrLogo: vi.fn(async (png: string, svg: string) => ({
    pngDataUrl: `${png}-logo`,
    svgString: `${svg}-logo`,
  })),
}));

import { compositeQrLogo } from "./composite-qr-logo";
import { generateQrCode } from "./generate-qr-code";

const baseResult = {
  pngDataUrl: "data:image/png;base64,qr",
  svgString: "<svg></svg>",
  size: 256,
  downloadNamePng: "qr-code.png",
  downloadNameSvg: "qr-code.svg",
};

describe("useQrCodeGenerator", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(generateQrCode).mockReset();
    vi.mocked(compositeQrLogo).mockClear();
    vi.mocked(generateQrCode).mockResolvedValue(baseResult);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to wireframe colors and empty content", () => {
    const { result } = renderHook(() => useQrCodeGenerator());

    expect(result.current.content).toBe("");
    expect(result.current.foreground).toBe("#222222");
    expect(result.current.background).toBe("#ffffff");
    expect(result.current.size).toBe(256);
    expect(result.current.errorCorrectionLevel).toBe("M");
    expect(result.current.result).toBeNull();
  });

  it("live-generates after debounce when content is set", async () => {
    const { result } = renderHook(() => useQrCodeGenerator());

    act(() => {
      result.current.setContent("https://example.com");
    });

    expect(generateQrCode).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIVE_DEBOUNCE_MS);
    });

    await waitFor(() => {
      expect(result.current.result?.pngDataUrl).toBe(baseResult.pngDataUrl);
    });
    expect(generateQrCode).toHaveBeenCalledTimes(1);
  });

  it("clears result when content becomes empty", async () => {
    const { result } = renderHook(() => useQrCodeGenerator());

    act(() => {
      result.current.setContent("hello");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIVE_DEBOUNCE_MS);
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    act(() => {
      result.current.setContent("   ");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIVE_DEBOUNCE_MS);
    });

    await waitFor(() => {
      expect(result.current.result).toBeNull();
    });
  });

  it("raises ECC to H when a logo is added while ECC is M", async () => {
    const { result } = renderHook(() => useQrCodeGenerator());
    const file = new File(["x"], "logo.png", { type: "image/png" });

    act(() => {
      result.current.setContent("https://example.com");
      result.current.setLogoFiles([file]);
    });

    expect(result.current.errorCorrectionLevel).toBe("H");
    expect(result.current.logoFile).toBe(file);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIVE_DEBOUNCE_MS);
    });

    await waitFor(() => {
      expect(compositeQrLogo).toHaveBeenCalled();
      expect(result.current.result?.pngDataUrl).toBe(
        `${baseResult.pngDataUrl}-logo`
      );
    });
  });

  it("does not call composite when logo is cleared", async () => {
    const { result } = renderHook(() => useQrCodeGenerator());
    const file = new File(["x"], "logo.png", { type: "image/png" });

    act(() => {
      result.current.setContent("https://example.com");
      result.current.setLogoFiles([file]);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIVE_DEBOUNCE_MS);
    });
    await waitFor(() => expect(compositeQrLogo).toHaveBeenCalled());

    vi.mocked(compositeQrLogo).mockClear();
    act(() => {
      result.current.setLogoFiles([]);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIVE_DEBOUNCE_MS);
    });

    await waitFor(() => {
      expect(result.current.logoFile).toBeNull();
      expect(result.current.result?.pngDataUrl).toBe(baseResult.pngDataUrl);
    });
    expect(compositeQrLogo).not.toHaveBeenCalled();
  });
});
