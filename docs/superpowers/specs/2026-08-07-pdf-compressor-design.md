# PDF Compressor — Design Spec

**Date:** 2026-08-07  
**Status:** Approved for implementation  
**Scope:** Client-side PDF compressor (scoped B, yes-only features).

## Goal

Add a **PDF compressor** tool so users can shrink PDFs entirely in the browser. Primary target is scanned / image-heavy PDFs (raster recompression). Secondary path is light structural optimize for text/vector PDFs. Files never leave the device.

## Product decisions

| Decision | Choice |
|----------|--------|
| Modes | Auto / Scanned / Optimize |
| Quality | Presets: High (200 DPI / 0.8), Balanced (150 / 0.6, default), Small (120 / 0.4) |
| Pipeline A | pdf.js render → OffscreenCanvas JPEG → pdf-lib rebuild, page-by-page in a Web Worker |
| Pipeline B | Object streams + strip metadata only |
| Auto mixed | Image-heavy pages via A; text pages via `copyPages`; final object-streams save |
| Classification | On file select; heuristic from image area ratio + text item count |
| Soft warn | 50 MB or 200+ pages |
| Hard reject | 200 MB or non-PDF |

## Out of scope

- OCR text-layer preservation
- Font dedupe / orphan object cleanup
- Selective embedded-image downsample without page rasterization
- WASM qpdf/mupdf
- Batch multi-file processing

## UX

1. **PageHeader** — “PDF compressor” / privacy subtitle. Primary: Compress; while running: Cancel.
2. **File** — CleanPlate file card; show size, page count, classification label.
3. **Controls** — Mode + quality preset (preset muted in Optimize-only).
4. **Progress** — Page X of Y (A) or “Optimizing…” (B).
5. **Result** — Before/after size, % reduction, first/last page thumbs, Download.
6. **Copy** — Scanned path warns about lost searchable text; Optimize sets modest-savings expectations.

## Architecture

```
UI → usePdfCompressor → Web Worker orchestrator
  → classify → Pipeline A / B / mixed
  → pdf-lib save → bytes + stats → UI
```

### Module layout

```
app/src/features/pdf-compressor/
  compress-pdf.ts
  classify-pdf.ts
  pipeline-image.ts
  pipeline-optimize.ts
  pdf-compressor.worker.ts
  use-pdf-compressor.ts
  pdf-compressor-page.tsx
  *.test.ts(x)
```

### Classification rules

Per page:

- **Scanned** if `imageAreaRatio >= 0.8 && textItemCount <= 5`
- **Text** if `imageAreaRatio < 0.2 && textItemCount > 20`
- Else ambiguous (counts as mixed for doc-level)

Doc-level: all scanned → scanned; all text → text; else mixed.

## Wire-up

- Route `/tools/pdf-compressor` above `:toolId`
- Registry entry `ready` with icon `picture_as_pdf`
- Feature CSS under `.pdf-*` in `app.css`

## Known limitations (UI copy)

- Won’t match Ghostscript on complex text PDFs
- Rasterizing loses searchable text unless a future OCR-preserve toggle is added
- Very large files are bounded by browser memory
