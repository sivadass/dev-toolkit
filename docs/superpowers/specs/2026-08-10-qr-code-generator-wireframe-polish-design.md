# QR Code Generator — Wireframe Polish Design

**Date:** 2026-08-10  
**Status:** Approved for implementation planning  
**Scope:** Polish the React QR Code generator (`app/`) to match the design wireframe (`design/qr-code-generator.html` + screenshot), including live generation and optional logo overlay.

## Goal

Make the live React tool feel like the wireframe: preview-first stage on the left, quiet inspector on the right, live updates as you type, and optional logo compositing in Advanced — without inventing a second visual system outside existing app tokens.

## Product decisions

| Decision | Choice |
|----------|--------|
| Layout | Preview stage left · inspector right |
| Page chrome | No `ToolPageHeader`; visually hidden `<h1>` for a11y |
| Generate CTA | Removed — debounced live generation |
| Downloads | Solid PNG + outline SVG under stage; disabled until valid result |
| Logo | In scope — optional file in Advanced; composited on preview + downloads |
| ECC with logo | Auto-raise to **H** when logo is set if current ECC is L or M |
| Defaults | Empty content; fg `#222222`; bg `#ffffff`; size `256`; ECC `M` |
| Approach | Structure + behavior port (match wireframe DOM/CSS patterns in app) |

## Out of scope

- JPEG / WebP download
- Module style (dots/rounded), eye style
- Content-type tabs (Link / Text / V-card)
- Design templates / social branded presets
- Changing headers on other tool pages
- Wiring logo into the static `design/` prototype JS (React is the source of truth for this feature)

## Layout & chrome

### Desktop (≥ ~900px)

Two-column grid inside tool main (~1.2fr : 0.8fr):

1. **Left — Stage** (not a titled card)
   - Soft gradient square stage
   - White plate with shadow holding the QR image
   - Meta under stage: `{size}×{size}px` (mono, muted); hidden when no result
   - Empty/idle: dimmed stage + placeholder (“Enter content to preview” or dimmed placeholder QR)
   - Footer: equal-width **PNG** (solid) + **SVG** (outline)

2. **Right — Inspector**
   - Soft surface panel (no “Customization” title, no Generate button)
   - Order: Content → Colors → Advanced (`details`, collapsed by default)

Stage is sticky on scroll at desktop widths.

### Mobile

Single column: inspector first, stage second.

### Accessibility

- Visually hidden page title: “QR Code generator”
- Stage uses `aria-live="polite"` for preview updates
- Errors via `Alert` above the grid

## Behavior & data flow

### Live generation

- Debounce ~120ms on content, size, ECC, colors, and logo changes
- Empty or invalid content → clear result, dim stage, disable downloads
- Valid content → auto-generate; ignore stale async results (request id / abort pattern)
- Hint: “Up to 2000 characters. Updates live.”

### Logo

- Optional single image via `FormControls.File` (card/compact): PNG, JPEG, SVG, WebP
- Hint: “Optional. Keep it small for scan reliability.”
- After QR generation, composite logo centered (~18–22% of QR size) with a small white pad
- Applied to preview, PNG download, and SVG download
- Clearing the file removes the logo and regenerates
- When a logo is set and ECC is L or M, auto-set ECC to H (user may still choose Q/H manually)

### Advanced (collapsed by default)

1. Logo upload  
2. Size (128–1024, step 32)  
3. Error correction (L / M / Q / H)

### Validation & errors

Reuse existing rules from `generate-qr-code.ts` (content length, size bounds, hex colors, fg ≠ bg, capacity). Logo load failures show a short error and fall back to QR-only output.

## Visual system

Port wireframe QR styles into `app/src/styles/app.css`, mapping to existing app CSS variables where possible:

- Stage: soft gradient, light border, ~20px radius
- Plate: white card, shadow; `is-ready` / `is-dimmed` states; subtle enter motion
- Inspector: light fill, soft border, rounded; `COLORS` section title uppercase muted
- Advanced: bordered `details` with tune icon + chevron
- Respect `prefers-reduced-motion`

### Components

CleanPlate: `FormControls.TextArea`, `ColorPicker`, `Stepper`, `Select`, `File`, `Button`, `Icon`, `Alert`, `Typography`.

Do **not** use `ToolSurface` or “Preview” / “Customization” titles on this page.

## Architecture (app)

| Unit | Responsibility |
|------|----------------|
| `qr-code-generator-page.tsx` | Layout markup matching wireframe structure |
| `use-qr-code-generator.ts` | State, debounce, live generate, logo file state, ECC auto-raise |
| `generate-qr-code.ts` | Core QR encode (existing) |
| Logo composite helper (new, kebab-case) | Overlay logo onto PNG data URL and SVG string |
| `app.css` | Stage / inspector / advanced visual polish |

## Testing

- Update page tests: no Generate button; no “Preview” / “Customization” titles; downloads disabled when empty; Advanced + logo control present
- Hook tests: debounce live generate; clear on empty content; logo clear regenerates without overlay
- Unit tests for logo compositing: PNG includes overlay; clear path returns QR-only

## Success criteria

- First viewport matches wireframe composition (no tool header, stage + inspector)
- Typing content updates the QR live; PNG/SVG download the current result
- Optional logo appears centered on preview and in downloads
- Layout stacks cleanly on narrow viewports
- Existing validation behavior preserved; tests updated and passing
