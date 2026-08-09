# QR Code Generator Layout — Design Spec

**Date:** 2026-08-08  
**Status:** Approved for prototype  
**Scope:** Redesign the QR Code generator layout in `design/` as a static HTML prototype. React app port is a follow-up.

## Goal

Give the QR Code generator a **preview-first, two-column** tool layout that feels like a small design tool: the QR dominates the left column; content and options live on the right. Stay within existing DevToolkit shell, tokens, and live-app feature set.

## Product decisions

| Decision | Choice |
|----------|--------|
| Layout | Preview left · controls right |
| Feature set | Match live app (content, size, ECC, colors, PNG + SVG) |
| Generate CTA | Primary button in customization card header |
| Downloads | Outline PNG + SVG under preview (enabled after generate) |
| Visual system | Existing `design/assets/styles` tokens — no new theme |
| Mobile | Single column: controls first, then preview |

## Out of scope (this prototype)

- Logo upload, module style (dots/rounded), eye style
- JPEG / WEBP download
- Design templates / social branded presets
- Content-type tabs (Link / Text / V-card / PDF)
- Live-as-you-type generation (prototype may show a filled state statically)
- Porting layout into the React app (`app/`)

## UX

### Shell

Unchanged: site header, tools sidebar, tool main with page title and short hint (“Generate a QR code in your browser.”).

### Desktop (≥ ~900px)

Two-column grid inside `tool-main` (~1:1 or 5:4):

1. **Left — Preview card**
   - Title: “Preview”
   - Muted square stage for the QR (soft fill / subtle pattern so light codes remain readable)
   - Empty state: “Generate to preview”
   - Filled state: centered QR + size caption (e.g. `256×256px`)
   - Actions: equal-width **Download PNG** and **Download SVG** (outline); disabled or inert until generated

2. **Right — Customization card**
   - Header row: “Customization” title + **Generate** primary button
   - **Content** — textarea with character/URL hint
   - **Size** + **Error correction** — side-by-side controls
   - **Foreground** + **Background** — side-by-side color fields (swatch + hex)

### Mobile

Stack to one column: customization card first, preview card second.

### States in the prototype

- Represent empty and filled preview in the static HTML (prefer filled as the default demo state so the layout reads clearly).
- Optional error alert above the columns for visual completeness (non-interactive).

## Structure (prototype files)

```
design/qr-code-generator.html          — page markup
design/assets/styles/components.css    — QR-specific components (or shared panel patterns)
design/assets/styles/layout.css        — two-column grid utilities if needed
```

Reuse existing `.panel`, `.field`, `.btn`, `.tool-main` patterns. Add only QR-specific classes (e.g. `.qr-layout`, `.qr-preview-stage`, `.qr-options-row`, `.qr-download-row`).

## Visual notes

- Use `--color-primary`, `--color-accent`, `--color-surface-muted`, `--radius-panel`, `--shadow-shell` from tokens.
- Avoid inventing a second brand palette or heavy card chrome beyond existing panels.
- Preview stage should be the visual anchor of the page content area.

## Success criteria

- Opening `design/qr-code-generator.html` shows a clear two-column, preview-first composition.
- All live-app controls are present and labeled; no out-of-scope features appear.
- Layout stacks cleanly on a narrow viewport.
- Prototype uses design-system tokens and matches other tool pages’ shell.
