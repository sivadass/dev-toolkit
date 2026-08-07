# Tool Pages Quiet Craft — Design Spec

**Date:** 2026-08-07  
**Status:** Approved for implementation  
**Scope:** Shared tool chrome + shared tool page template across all tool routes; image compressor (and PDF compressor) get workspace-rhythm refinements. Home page quiet craft remains the visual north star.

## Goal

Bring tool pages into the same **quiet craft** language as the home page — soft wash, frosted surfaces, display typography, restraint over theater — while keeping tools fast and functional. Image compressor is the workspace-rhythm reference; every tool adopts the shared template this pass.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Premium meaning | Quiet craft — same as home |
| Scope | Full tool-system refresh this pass (shared chrome + shared page template) |
| Shared chrome | Soft wash + frosted sidebar (active = quiet indigo well, not solid navy pill) |
| Image compressor content | Workspace rhythm — file + Compress primary; options secondary; frosted preview anchor |
| Approach | Shared chrome tokens + full shared tool page template adopted by all tools now |
| PDF compressor | Align with image compressor (CTA with file step + frosted panes) |

## Out of scope

- Dark mode, search, filters, new tools
- Redesigning CleanPlate control internals (stepper / select / file beyond surface wrappers)
- Restoring the floating prototype shell (`shell--blob`)
- Per-tool marketing blocks, stats strips, or badges
- Heavy motion, parallax, or illustration
- Changing compression / encode / compare behavior beyond presentation and CTA placement

## Current problems (why)

- Flat white/gray tool shell and solid sidebar pill fight the refined home wash
- Bordered `Container` cards and stock `PageHeader` read as generic SaaS utility UI
- Compress CTA competes with the title row instead of sitting with the primary file step
- Home → tool navigation feels like two products

## Visual design

### Shared atmosphere (`.tool-shell`)

- Same family as `.home-shell`: soft diagonal / radial wash — cool indigo-gray into a faint warm edge (reuse home gradient tokens or shared CSS variables; not a flat single fill; not purple glow).
- Content sits on the wash; avoid a heavy white content slab that cancels the atmosphere.
- Site header (wordmark + All tools) sits on the wash; avoid a stark flat bar that fights the canvas.

### Frosted sidebar

- Translucent / frosted strip (no heavy border).
- Inactive items: quiet primary text + icons.
- Active item: soft indigo well (not solid filled navy pill); clear `aria-current` / active affordance retained.
- Focus-visible: soft indigo ring (accessible).

### Shared page template

#### `ToolPageHeader`

Replaces CleanPlate `PageHeader` on all tool routes:

1. **Kicker** (optional) — e.g. `Client-side · Private` where privacy/local processing fits. Uppercase, tracked, small. Accent `#f39660` / `--home-accent`.
2. **Title** — Tool name in **DM Serif Display**, primary indigo `#0c0a5d`, clear size step above body UI.
3. **Subtitle** — One muted lead line (existing tool subtitles, lightly tightened if needed).
4. **Primary CTA slot** (optional) — For tools that keep action in the header. Image/PDF compressor omit CTA here (see workspace rhythm).

#### `ToolSurface`

- Frosted panel for drop zones, results, previews: translucent white fill (`rgba(255,255,255,~0.72)` or tokenized equivalent).
- **No** hard border, **No** drop shadow by default.
- Used instead of `Container showBorder` for tool result/preview panes.

Keep CleanPlate controls (`FormControls.File`, `Stepper`, `Select`, `Button`, `Alert`, etc.); only chrome and surfaces change.

### Interaction / motion

- Hover on frosted surfaces: slightly brighter / more opaque fill; **no** `translateY` lift.
- Focus-visible: soft indigo ring.
- Respect `prefers-reduced-motion: reduce`.

### Color & type tokens

Prefer shared variables (extend `brand.css`) so home and tools stay aligned:

| Token / role | Value / source |
|--------------|----------------|
| Primary brand | `#0c0a5d` (existing) |
| Accent (kicker) | `#f39660` / `--home-accent` |
| Display font | `DM Serif Display` |
| Canvas wash | Same multi-stop treatment as home |
| Frosted fill | ~`rgba(255,255,255,0.72)` |

## Image compressor — workspace rhythm

Same workflow order (file → options → preview); clearer hierarchy.

1. **Header** — Kicker + display title + muted lead; no Compress in header.
2. **Primary step** — Frosted file drop zone; **Compress** co-located with this step (beside on desktop, below on narrow). Helper copy under drop zone stays quieter.
3. **Options** — Quality / max dimension / output format in one quieter row (no bordered card wrapper); hint below.
4. **Preview** — Two frosted panes (Original | Compressed). Empty: muted placeholders. After compress: image, meta, Download in compressed pane. Side-by-side from ~768px; stacked below.

## Other tools this pass

| Tool | Adoption |
|------|----------|
| All 8 tool pages | `ToolPageHeader` + frosted surfaces where bordered panes exist |
| PDF compressor | Same workspace rhythm as image (CTA with file step + frosted panes) |
| QR generator / decoder, JSON comparer, text comparer, Base64 | Header + surface swap; keep existing CTA placement unless already co-located with input |
| JSON visualiser | Header + surfaces only; preserve viewport-lock / internal scroll |

## UX / content rules

1. Tool pages remain workspaces, not marketing landings.
2. Privacy stated once via kicker/subtitle where appropriate — not repeated as badges.
3. One primary action per tool should be visually obvious; options stay secondary.
4. Do not add stats strips, promo chips, or secondary marketing blocks.

## Implementation sketch

| Area | Change |
|------|--------|
| `brand.css` / `app.css` | Shared wash on `.tool-shell`; frosted sidebar; `ToolPageHeader` / `ToolSurface` styles; preview/options quieting |
| `tool-layout.tsx` | Class hooks for chrome; sidebar active via CSS targeting AppShell sidebar |
| New `tool-page-header.tsx` (kebab-case) | Shared header primitive |
| `ToolSurface` | Component and/or shared class used by tool pages |
| All `app/src/features/**/*-page.tsx` | Adopt header + surfaces |
| Image + PDF compressor pages | Workspace CTA placement |
| Tests | Update selectors/assertions for header/CTA/structure as needed |

CleanPlate: keep existing control imports; do not invent parallel form controls for this pass.

## Accessibility

- Maintain skip link / main landmark behavior.
- Focus rings visible on sidebar items, frosted interactive surfaces, and CTAs.
- Color contrast: indigo and muted text on wash/frosted panels must meet WCAG AA for body/UI text.
- Active nav must not rely on color alone (well + weight / `aria-current` as applicable).

## Success criteria

- Home → any tool feels like one product (wash + frosted language).
- All tool titles use display serif + shared header rhythm.
- Image and PDF compressor: clear primary step → options → preview.
- Scanning/using tools stays as fast; less border noise.
- Existing tool behavior preserved; tests updated and passing.

## Non-goals / YAGNI

- Animation beyond subtle hover/focus
- Per-tool custom illustrations
- Unifying every tool’s internal layout beyond header + surfaces (except image/PDF workspace rhythm)
