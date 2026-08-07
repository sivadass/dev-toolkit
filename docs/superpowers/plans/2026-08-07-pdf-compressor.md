# PDF Compressor Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or executing-plans task-by-task. Checkboxes track progress.

**Goal:** Ship `/tools/pdf-compressor`: compress PDFs entirely in-browser via scanned-page raster recompression (primary) and light structural optimize (secondary), with Auto mode, presets, progress/cancel, and before/after preview.

**Architecture:** Main-thread UI (mirror image-compressor) posts file bytes + options to a Vite module Web Worker. Worker uses pdf.js to classify/render and pdf-lib to rebuild. Pipeline A: page-by-page OffscreenCanvas → JPEG → embed. Pipeline B: `save({ useObjectStreams: true })` + strip metadata. Mixed Auto: Pipeline A for image-heavy pages, `copyPages` for text pages, then B-style final save.

**Tech Stack:** React 19, CleanPlate, React Router 7, Vitest, `pdfjs-dist`, `pdf-lib`, native Web Workers (no Comlink).

**Global constraints:**

- Client-side only; kebab-case filenames; CleanPlate props over inline styles (`app/AGENTS.md`)
- Soft warn: 50 MB or 200+ pages; hard reject: 200 MB or non-PDF
- Presets: High `200 DPI / 0.8`, Balanced `150 / 0.6` (default), Small `120 / 0.4`
- Out of scope: OCR text preservation, font dedupe, selective image XObject downsample, WASM qpdf/mupdf, batch files

## Implementation tasks

- [ ] Write design/plan docs; add `pdf-lib` + `pdfjs-dist`; configure pdf.js worker for Vite
- [ ] TDD `compress-pdf.ts` (presets, limits, validate, download name)
- [ ] TDD `classify-pdf.ts` heuristic from page stats
- [ ] `pipeline-optimize.ts` (object streams + strip metadata)
- [ ] `pipeline-image.ts` (page-by-page render/JPEG/rebuild)
- [ ] `pdf-compressor.worker.ts` orchestrator + progress/cancel
- [ ] `use-pdf-compressor` + `PdfCompressorPage` + `app.css`
- [ ] Registry, route, tests; `npm test` / typecheck / lint

## Out of scope

OCR text-layer preservation; font dedupe; selective embedded-image downsample without page rasterization; WASM qpdf/mupdf; multi-file batch; matching Ghostscript ratios on complex text PDFs.
