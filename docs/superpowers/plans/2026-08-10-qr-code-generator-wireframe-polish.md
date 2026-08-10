# QR Code Generator Wireframe Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the React QR Code generator so it matches the wireframe: headerless stage + inspector layout, debounced live generation, and optional logo compositing.

**Architecture:** Keep `generate-qr-code.ts` as the encoder. Add a pure `composite-qr-logo.ts` helper for PNG/SVG overlays. Rewrite `use-qr-code-generator.ts` for debounced live generation, logo file state, and ECC auto-raise. Restructure `qr-code-generator-page.tsx` and QR CSS in `app.css` to mirror `design/qr-code-generator.html`.

**Tech Stack:** React 19, TypeScript, CleanPlate, Vitest + Testing Library, `qrcode`, Canvas API for logo overlay.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-10-qr-code-generator-wireframe-polish-design.md`
- Filenames: kebab-case only
- No `ToolPageHeader` on this page; visually hidden `<h1>QR Code generator</h1>`
- No Generate button — live updates (~120ms debounce)
- Logo optional in Advanced; composite on preview + PNG + SVG
- When logo set and ECC is L or M → auto-set ECC to H
- Defaults: empty content; fg `#222222`; bg `#ffffff`; size `256`; ECC `M`
- Prefer CleanPlate props for spacing; app CSS for stage/inspector chrome
- Out of scope: JPEG/WebP download, module/eye styles, content tabs, other tool headers, design/ prototype JS logo wiring

---

## File map

| File | Responsibility |
|------|----------------|
| `app/src/features/qr-code-generator/composite-qr-logo.ts` | Overlay logo onto PNG data URL + SVG string |
| `app/src/features/qr-code-generator/composite-qr-logo.test.ts` | Unit tests for compositing |
| `app/src/features/qr-code-generator/use-qr-code-generator.ts` | Live debounce, logo state, ECC auto-raise |
| `app/src/features/qr-code-generator/use-qr-code-generator.test.ts` | Hook tests |
| `app/src/features/qr-code-generator/qr-code-generator-page.tsx` | Wireframe layout markup |
| `app/src/features/qr-code-generator/qr-code-generator-page.test.tsx` | Page smoke/UI tests |
| `app/src/styles/app.css` | Stage, plate, inspector, advanced visual polish |
| `app/src/features/qr-code-generator/generate-qr-code.ts` | Unchanged encoder (call site only) |

---

### Task 1: Logo compositing helper

**Files:**
- Create: `app/src/features/qr-code-generator/composite-qr-logo.ts`
- Create: `app/src/features/qr-code-generator/composite-qr-logo.test.ts`

**Interfaces:**
- Consumes: PNG data URL string, SVG markup string, `File`, QR `size` (px)
- Produces:
  - `export const LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"] as const`
  - `export const LOGO_SIZE_RATIO = 0.2` (logo max side = 20% of QR size)
  - `export async function compositeQrLogo(pngDataUrl: string, svgString: string, logoFile: File, size: number): Promise<{ pngDataUrl: string; svgString: string }>`
  - Throws `Error("Could not load logo image.")` on load failure

- [ ] **Step 1: Write the failing tests**

Create `app/src/features/qr-code-generator/composite-qr-logo.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npm test -- src/features/qr-code-generator/composite-qr-logo.test.ts`

Expected: FAIL — module or exports not found

- [ ] **Step 3: Implement `composite-qr-logo.ts`**

Create `app/src/features/qr-code-generator/composite-qr-logo.ts`:

```ts
export const LOGO_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
] as const;

/** Logo max side as a fraction of QR size (spec: ~18–22%). */
export const LOGO_SIZE_RATIO = 0.2;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not load logo image."));
    };
    reader.onerror = () => reject(new Error("Could not load logo image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load logo image."));
    image.src = src;
  });
}

function fitLogoSize(
  naturalWidth: number,
  naturalHeight: number,
  maxSide: number
): { width: number; height: number } {
  const scale = Math.min(
    maxSide / Math.max(naturalWidth, 1),
    maxSide / Math.max(naturalHeight, 1),
    1
  );
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
  };
}

async function compositePng(
  pngDataUrl: string,
  logo: HTMLImageElement,
  size: number
): Promise<string> {
  const qrImage = await loadImage(pngDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not load logo image.");

  ctx.drawImage(qrImage, 0, 0, size, size);

  const maxSide = Math.round(size * LOGO_SIZE_RATIO);
  const { width, height } = fitLogoSize(
    logo.naturalWidth || logo.width,
    logo.naturalHeight || logo.height,
    maxSide
  );
  const pad = Math.round(Math.max(width, height) * 0.18);
  const boxW = width + pad * 2;
  const boxH = height + pad * 2;
  const boxX = Math.round((size - boxW) / 2);
  const boxY = Math.round((size - boxH) / 2);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.drawImage(logo, boxX + pad, boxY + pad, width, height);

  return canvas.toDataURL("image/png");
}

function compositeSvg(
  svgString: string,
  logoDataUrl: string,
  logo: HTMLImageElement,
  size: number
): string {
  const maxSide = Math.round(size * LOGO_SIZE_RATIO);
  const { width, height } = fitLogoSize(
    logo.naturalWidth || logo.width,
    logo.naturalHeight || logo.height,
    maxSide
  );
  const pad = Math.round(Math.max(width, height) * 0.18);
  const boxW = width + pad * 2;
  const boxH = height + pad * 2;
  const boxX = Math.round((size - boxW) / 2);
  const boxY = Math.round((size - boxH) / 2);

  const overlay = [
    `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="#ffffff"/>`,
    `<image href="${logoDataUrl}" x="${boxX + pad}" y="${boxY + pad}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`,
  ].join("");

  if (svgString.includes("</svg>")) {
    return svgString.replace("</svg>", `${overlay}</svg>`);
  }
  return `${svgString}${overlay}`;
}

export async function compositeQrLogo(
  pngDataUrl: string,
  svgString: string,
  logoFile: File,
  size: number
): Promise<{ pngDataUrl: string; svgString: string }> {
  const logoDataUrl = await readFileAsDataUrl(logoFile);
  const logo = await loadImage(logoDataUrl);
  const nextPng = await compositePng(pngDataUrl, logo, size);
  const nextSvg = compositeSvg(svgString, logoDataUrl, logo, size);
  return { pngDataUrl: nextPng, svgString: nextSvg };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd app && npm test -- src/features/qr-code-generator/composite-qr-logo.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/features/qr-code-generator/composite-qr-logo.ts app/src/features/qr-code-generator/composite-qr-logo.test.ts
git commit -m "$(cat <<'EOF'
feat(qr): add logo compositing helper for PNG and SVG

EOF
)"
```

---

### Task 2: Live-generation hook

**Files:**
- Modify: `app/src/features/qr-code-generator/use-qr-code-generator.ts`
- Create: `app/src/features/qr-code-generator/use-qr-code-generator.test.ts`

**Interfaces:**
- Consumes: `generateQrCode` from `./generate-qr-code`; `compositeQrLogo` from `./composite-qr-logo`
- Produces hook API:

```ts
{
  content: string;
  setContent: (v: string) => void;
  size: number;
  setSize: (v: number) => void;
  errorCorrectionLevel: ErrorCorrectionLevel;
  setErrorCorrectionLevel: (v: ErrorCorrectionLevel) => void;
  foreground: string;
  setForeground: (v: string) => void;
  background: string;
  setBackground: (v: string) => void;
  logoFile: File | null;
  setLogoFiles: (files: File[]) => void; // takes first file or clears
  result: GenerateQrResult | null;
  error: string | null;
  isGenerating: boolean;
}
```

- No `generate`, `canGenerate`
- Defaults: `foreground = "#222222"`, `background = "#ffffff"`, `size = 256`, `ecc = "M"`, `content = ""`
- `export const LIVE_DEBOUNCE_MS = 120`
- When `setLogoFiles` receives a file and current ECC is `"L"` or `"M"`, set ECC to `"H"`

- [ ] **Step 1: Write the failing hook tests**

Create `app/src/features/qr-code-generator/use-qr-code-generator.test.ts`:

```ts
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

import { generateQrCode } from "./generate-qr-code";
import { compositeQrLogo } from "./composite-qr-logo";

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd app && npm test -- src/features/qr-code-generator/use-qr-code-generator.test.ts`

Expected: FAIL — missing `LIVE_DEBOUNCE_MS` / logo API / live behavior

- [ ] **Step 3: Rewrite the hook**

Replace `app/src/features/qr-code-generator/use-qr-code-generator.ts` with:

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { compositeQrLogo } from "./composite-qr-logo";
import {
  generateQrCode,
  type ErrorCorrectionLevel,
  type GenerateQrResult,
} from "./generate-qr-code";

export const LIVE_DEBOUNCE_MS = 120;

export function useQrCodeGenerator() {
  const [content, setContent] = useState("");
  const [size, setSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("M");
  const [foreground, setForeground] = useState("#222222");
  const [background, setBackground] = useState("#ffffff");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [result, setResult] = useState<GenerateQrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const requestIdRef = useRef(0);

  const setLogoFiles = useCallback((files: File[]) => {
    const next = files[0] ?? null;
    setLogoFile(next);
    if (next) {
      setErrorCorrectionLevel((current) =>
        current === "L" || current === "M" ? "H" : current
      );
    }
  }, []);

  useEffect(() => {
    const trimmed = content.trim();
    if (!trimmed) {
      requestIdRef.current += 1;
      setResult(null);
      setError(null);
      setIsGenerating(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;
      setIsGenerating(true);
      setError(null);

      void (async () => {
        try {
          let next = await generateQrCode(content, {
            size,
            errorCorrectionLevel,
            foreground,
            background,
          });
          if (logoFile) {
            try {
              const withLogo = await compositeQrLogo(
                next.pngDataUrl,
                next.svgString,
                logoFile,
                next.size
              );
              next = { ...next, ...withLogo };
            } catch (logoErr) {
              if (requestId !== requestIdRef.current) return;
              setError(
                logoErr instanceof Error
                  ? logoErr.message
                  : "Could not load logo image."
              );
            }
          }
          if (requestId !== requestIdRef.current) return;
          setResult(next);
        } catch (err) {
          if (requestId !== requestIdRef.current) return;
          setResult(null);
          setError(
            err instanceof Error ? err.message : "Could not generate QR code."
          );
        } finally {
          if (requestId === requestIdRef.current) {
            setIsGenerating(false);
          }
        }
      })();
    }, LIVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    content,
    size,
    errorCorrectionLevel,
    foreground,
    background,
    logoFile,
  ]);

  return {
    content,
    setContent,
    size,
    setSize,
    errorCorrectionLevel,
    setErrorCorrectionLevel,
    foreground,
    setForeground,
    background,
    setBackground,
    logoFile,
    setLogoFiles,
    result,
    error,
    isGenerating,
  };
}
```

- [ ] **Step 4: Run hook tests to verify they pass**

Run: `cd app && npm test -- src/features/qr-code-generator/use-qr-code-generator.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/features/qr-code-generator/use-qr-code-generator.ts app/src/features/qr-code-generator/use-qr-code-generator.test.ts
git commit -m "$(cat <<'EOF'
feat(qr): switch generator hook to debounced live updates

EOF
)"
```

---

### Task 3: Restructure page markup + page tests

**Files:**
- Modify: `app/src/features/qr-code-generator/qr-code-generator-page.tsx`
- Modify: `app/src/features/qr-code-generator/qr-code-generator-page.test.tsx`

**Interfaces:**
- Consumes: hook API from Task 2 (`logoFile`, `setLogoFiles`, no `generate`/`canGenerate`)
- Consumes: `LOGO_ACCEPTED_TYPES` from `./composite-qr-logo`
- Produces: wireframe DOM structure with classes `qr-layout`, `qr-stage`, `qr-inspector`, `qr-preview-stage`, `qr-preview-stage__plate`, `qr-advanced`

- [ ] **Step 1: Rewrite page tests for the wireframe UI**

Replace `app/src/features/qr-code-generator/qr-code-generator-page.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QrCodeGeneratorPage } from "./qr-code-generator-page";

describe("QrCodeGeneratorPage", () => {
  it("renders a visually hidden title and no Generate button", () => {
    render(<QrCodeGeneratorPage />);
    expect(
      screen.getByRole("heading", { name: "QR Code generator", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /generate/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Preview")).not.toBeInTheDocument();
    expect(screen.queryByText("Customization")).not.toBeInTheDocument();
  });

  it("disables download actions before a live result exists", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByRole("button", { name: /png/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /svg/i })).toBeDisabled();
  });

  it("renders content, colors, advanced, and logo controls", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText(/Updates live/i)).toBeInTheDocument();
    expect(screen.getByText("Colors")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.getByTestId("qr-foreground")).toBeInTheDocument();
    expect(screen.getByTestId("qr-background")).toBeInTheDocument();
    expect(screen.getByTestId("qr-logo-file")).toBeInTheDocument();
    expect(screen.getByTestId("qr-size")).toBeInTheDocument();
    expect(screen.getByTestId("qr-ecc")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run page tests to verify they fail**

Run: `cd app && npm test -- src/features/qr-code-generator/qr-code-generator-page.test.tsx`

Expected: FAIL against current markup

- [ ] **Step 3: Rewrite the page component**

Replace `app/src/features/qr-code-generator/qr-code-generator-page.tsx` with:

```tsx
import {
  Alert,
  Button,
  Container,
  FormControls,
  Icon,
  Typography,
} from "cleanplate";
import type { ErrorCorrectionLevel } from "./generate-qr-code";
import { MAX_CONTENT_LENGTH, MAX_SIZE, MIN_SIZE } from "./generate-qr-code";
import { LOGO_ACCEPTED_TYPES } from "./composite-qr-logo";
import { useQrCodeGenerator } from "./use-qr-code-generator";

const ECC_OPTIONS: {
  label: string;
  value: ErrorCorrectionLevel;
  meta: string;
}[] = [
  { label: "L (~7%)", value: "L", meta: "Lowest recovery" },
  { label: "M (~15%)", value: "M", meta: "Balanced" },
  { label: "Q (~25%)", value: "Q", meta: "Higher recovery" },
  { label: "H (~30%)", value: "H", meta: "Highest recovery" },
];

function downloadDataUrl(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

function downloadSvg(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}

export function QrCodeGeneratorPage() {
  const {
    content,
    setContent,
    size,
    setSize,
    errorCorrectionLevel,
    setErrorCorrectionLevel,
    foreground,
    setForeground,
    background,
    setBackground,
    logoFile,
    setLogoFiles,
    result,
    error,
  } = useQrCodeGenerator();

  const selectedEcc =
    ECC_OPTIONS.find((o) => o.value === errorCorrectionLevel) ?? ECC_OPTIONS[1];
  const hasResult = Boolean(result);

  return (
    <>
      <h1 className="visually-hidden">QR Code generator</h1>

      {error ? <Alert message={error} variant="error" margin="b-4" /> : null}

      <Container display="block" margin="0" padding="0">
        <div className="qr-layout">
          <section className="qr-stage" aria-label="QR preview">
            <div
              className={`qr-preview-stage${hasResult ? " is-ready" : " is-dimmed"}`}
              aria-live="polite"
            >
              <div className="qr-preview-stage__plate">
                {result ? (
                  <img
                    className="qr-preview-stage__img"
                    src={result.pngDataUrl}
                    alt="QR code preview"
                    width={result.size}
                    height={result.size}
                  />
                ) : (
                  <Typography
                    variant="small"
                    margin="0"
                    className="qr-preview-stage__placeholder"
                  >
                    Enter content to preview
                  </Typography>
                )}
              </div>
            </div>

            <div className="qr-stage__footer">
              {result ? (
                <Typography
                  variant="small"
                  margin="0"
                  className="qr-preview-meta"
                >
                  {`${result.size}×${result.size}px`}
                </Typography>
              ) : null}
              <div className="qr-download-row">
                <Button
                  variant="solid"
                  isDisabled={!result}
                  onClick={() =>
                    result
                      ? downloadDataUrl(
                          result.pngDataUrl,
                          result.downloadNamePng
                        )
                      : undefined
                  }
                >
                  <Icon name="download" />
                  PNG
                </Button>
                <Button
                  variant="outline"
                  isDisabled={!result}
                  onClick={() =>
                    result
                      ? downloadSvg(result.svgString, result.downloadNameSvg)
                      : undefined
                  }
                >
                  <Icon name="download" />
                  SVG
                </Button>
              </div>
            </div>
          </section>

          <section className="qr-inspector" aria-label="QR options">
            <FormControls.TextArea
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://example.com"
              isFluid
              margin="0"
              dataTestId="qr-content"
            />
            <Typography variant="small" margin="0" className="tool-hint">
              Up to {MAX_CONTENT_LENGTH} characters. Updates live.
            </Typography>

            <div className="qr-inspector__section">
              <Typography
                variant="small"
                margin="0"
                className="qr-section-title"
              >
                Colors
              </Typography>
              <div
                className="qr-options-row qr-options-row--two"
                data-testid="qr-color-row"
              >
                <FormControls.ColorPicker
                  label="Foreground"
                  value={foreground}
                  onChange={(color) => {
                    if (color) setForeground(color);
                  }}
                  clearable={false}
                  isFluid
                  margin="0"
                  dataTestId="qr-foreground"
                />
                <FormControls.ColorPicker
                  label="Background"
                  value={background}
                  onChange={(color) => {
                    if (color) setBackground(color);
                  }}
                  clearable={false}
                  isFluid
                  margin="0"
                  dataTestId="qr-background"
                />
              </div>
            </div>

            <details className="qr-advanced">
              <summary className="qr-advanced__summary">
                <Icon name="tune" />
                Advanced
              </summary>
              <div className="qr-advanced__body">
                <FormControls.File
                  label="Logo"
                  variant="card"
                  multiple={false}
                  accept={LOGO_ACCEPTED_TYPES.join(",")}
                  value={logoFile ? [logoFile] : []}
                  onChange={(files) => setLogoFiles(files)}
                  dropZoneText="Add a logo"
                  buttonLabel="Browse"
                  isFluid
                  margin="0"
                  dataTestId="qr-logo-file"
                />
                <Typography variant="small" margin="0" className="tool-hint">
                  Optional. Keep it small for scan reliability.
                </Typography>

                <div className="qr-options-row qr-options-row--two">
                  <FormControls.Stepper
                    label="Size (px)"
                    value={String(size)}
                    min={MIN_SIZE}
                    max={MAX_SIZE}
                    step={32}
                    onChange={(e) =>
                      setSize(Number(e.target.value) || MIN_SIZE)
                    }
                    isFluid
                    margin="0"
                    dataTestId="qr-size"
                  />
                  <FormControls.Select
                    label="Error correction"
                    options={ECC_OPTIONS}
                    value={selectedEcc}
                    searchable={false}
                    onChange={(option) => {
                      if (option && !Array.isArray(option)) {
                        setErrorCorrectionLevel(
                          String(option.value) as ErrorCorrectionLevel
                        );
                      }
                    }}
                    isFluid
                    margin="0"
                    dataTestId="qr-ecc"
                  />
                </div>
              </div>
            </details>
          </section>
        </div>
      </Container>
    </>
  );
}
```

- [ ] **Step 4: Run page tests**

Run: `cd app && npm test -- src/features/qr-code-generator/qr-code-generator-page.test.tsx`

Expected: PASS (CSS can lag; markup must satisfy tests)

- [ ] **Step 5: Commit**

```bash
git add app/src/features/qr-code-generator/qr-code-generator-page.tsx app/src/features/qr-code-generator/qr-code-generator-page.test.tsx
git commit -m "$(cat <<'EOF'
feat(qr): restructure generator page to match wireframe layout

EOF
)"
```

---

### Task 4: Visual CSS polish

**Files:**
- Modify: `app/src/styles/app.css` (replace the existing `.qr-layout` through `.qr-advanced__body` block; keep `.qr-preview` / `.qr-decoder-*` rules for the decoder tool)

**Interfaces:**
- Consumes: app tokens (`--space-*`, `--primary-brand`, `--text-subtle`, `--gray-200`, `--radius-*`)
- Produces: wireframe-matching stage/inspector styles + `.visually-hidden`

- [ ] **Step 1: Add `.visually-hidden` and replace QR generator layout styles**

In `app/src/styles/app.css`, ensure a utility exists (add near the top of the file if missing):

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

Replace the generator-specific block from `.qr-layout` through `.qr-advanced__body` (do **not** remove `.qr-preview`, `.qr-preview__actions`, or `.qr-decoder-result__text`) with:

```css
.qr-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  align-items: start;
}

.qr-inspector {
  order: -1;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5);
  border-radius: 20px;
  background: #f7f8fa;
  border: 1px solid color-mix(in srgb, var(--primary-brand) 6%, transparent);
}

@media (min-width: 900px) {
  .qr-layout {
    grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
    gap: var(--space-6);
  }

  .qr-inspector {
    order: 0;
  }

  .qr-stage {
    position: sticky;
    top: var(--space-4);
  }
}

.qr-stage {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.qr-stage__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.qr-preview-stage {
  display: grid;
  place-items: center;
  min-height: 340px;
  aspect-ratio: 1;
  width: 100%;
  padding: var(--space-6);
  border-radius: 20px;
  background:
    radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, 0.7), transparent 55%),
    linear-gradient(165deg, #f4f5f8 0%, #eef0f4 48%, #e4e7ed 100%);
  border: 1px solid color-mix(in srgb, var(--primary-brand) 6%, transparent);
}

.qr-preview-stage.is-dimmed {
  background:
    radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, 0.45), transparent 55%),
    linear-gradient(165deg, #f0f1f4 0%, #e8eaee 100%);
}

.qr-preview-stage__plate {
  display: grid;
  place-items: center;
  padding: var(--space-5);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 16px 40px color-mix(in srgb, var(--primary-brand) 10%, transparent);
}

.qr-preview-stage.is-dimmed .qr-preview-stage__plate {
  box-shadow: 0 8px 20px color-mix(in srgb, var(--primary-brand) 5%, transparent);
  opacity: 0.72;
}

.qr-preview-stage__img {
  display: block;
  width: auto;
  max-width: min(100%, 256px);
  height: auto;
  image-rendering: pixelated;
  border-radius: 2px;
}

.qr-preview-stage__placeholder {
  color: var(--text-subtle);
  text-align: center;
}

.qr-preview-meta {
  margin: 0;
  text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  color: var(--text-subtle);
  letter-spacing: 0.02em;
}

.qr-download-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.qr-download-row > button {
  width: 100%;
}

.qr-section-title {
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  font-size: 0.6875rem;
  margin-bottom: var(--space-2) !important;
}

.qr-inspector__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.qr-options-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@media (min-width: 480px) {
  .qr-options-row--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.qr-advanced {
  margin: 0;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid color-mix(in srgb, var(--primary-brand) 8%, transparent);
  overflow: hidden;
}

.qr-advanced__summary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  font-weight: 600;
  color: var(--primary-brand);
  list-style: none;
  user-select: none;
}

.qr-advanced__summary::-webkit-details-marker {
  display: none;
}

.qr-advanced__summary::after {
  content: "expand_more";
  font-family: "Material Symbols Outlined", "Material Symbols Rounded", sans-serif;
  font-size: 1.25rem;
  margin-left: auto;
  line-height: 1;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}

.qr-advanced[open] .qr-advanced__summary::after {
  content: "expand_less";
}

.qr-advanced__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 0 var(--space-4) var(--space-4);
}

@media (prefers-reduced-motion: reduce) {
  .qr-stage,
  .qr-inspector,
  .qr-preview-stage__plate {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Typecheck and run all QR tests**

Run:

```bash
cd app && npm run typecheck && npm test -- src/features/qr-code-generator
```

Expected: typecheck OK; all QR tests PASS

- [ ] **Step 3: Manual visual check**

Run: `cd app && npm run dev`

Open the QR Code generator route. Confirm against the wireframe:
- No page header in main
- Gradient stage + white plate
- Soft inspector with Content → Colors → Advanced
- PNG solid / SVG outline
- Typing updates QR live; logo in Advanced composites when added

- [ ] **Step 4: Commit**

```bash
git add app/src/styles/app.css
git commit -m "$(cat <<'EOF'
style(qr): polish generator stage and inspector to match wireframe

EOF
)"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| No ToolPageHeader; visually hidden h1 | Task 3, 4 |
| Stage left / inspector right; mobile inspector first | Task 3, 4 |
| Live debounce ~120ms | Task 2 |
| Hint “Updates live.” | Task 3 |
| Solid PNG + outline SVG | Task 3 |
| Logo upload + composite PNG/SVG | Task 1, 2, 3 |
| ECC auto-raise to H when logo + L/M | Task 2 |
| Defaults `#222222` / `#ffffff` / 256 / M | Task 2 |
| CSS stage/plate/inspector/advanced | Task 4 |
| Tests for page, hook, composite | Tasks 1–3 |
| Out of scope items not implemented | All tasks |

## Self-review notes

- No TBD/placeholder steps; signatures consistent across tasks (`setLogoFiles`, `LIVE_DEBOUNCE_MS`, `compositeQrLogo`)
- Decoder-only CSS classes preserved in Task 4
- Hook no longer exports `generate` / `canGenerate` — page rewrite in Task 3 must land after Task 2 (or same PR session in order)
