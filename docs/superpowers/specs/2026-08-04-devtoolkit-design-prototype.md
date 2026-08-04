# DevToolkit Design Prototype Spec

**Date:** 2026-08-04  
**Status:** Approved for implementation planning  
**Scope:** Static HTML/CSS prototype under `/design` — layout, branding, tokens, accessibility. Not production tool logic.

## Goal

Ship a clickable HTML prototype for **DevToolkit** — free client-side developer utilities — that locks visual language, hybrid navigation, design tokens, and a11y patterns before building the real app.

## Product decisions

| Decision | Choice |
|----------|--------|
| Name | **DevToolkit** |
| Navigation | **Hybrid:** home tool grid for discovery; left sidebar once inside a tool |
| Visual personality | Clean workshop, refined toward a soft “app shell” dashboard feel |
| Theme modes | **Light only** in prototype; token structure ready for future themes |
| Brand palette | From [sivadass.in](https://sivadass.in/) |
| Prototype depth | Home + all listed tool shells + shared UI kit page |
| Implementation shape | Shared CSS/JS chrome; one HTML file per page; no build step |

## Out of scope

- Real image compression, QR generation, diff engines, Base64 logic
- Accounts, billing, analytics, SEO marketing site
- Dark / high-contrast themes (tokens must allow them later)
- Framework choice for the eventual app (prototype stays plain HTML)

## Information architecture

### Pages

| File | Role |
|------|------|
| `design/index.html` | Home: brand, short pitch, tool discovery grid (+ optional search UI) |
| `design/image-compressor.html` | Tool shell — upload / options / result regions |
| `design/qr-code-generator.html` | Tool shell |
| `design/json-comparer.html` | Tool shell — side-by-side panes |
| `design/text-comparer.html` | Tool shell — side-by-side panes |
| `design/base64.html` | Tool shell — encode / decode |
| `design/ui-kit.html` | Buttons, inputs, alerts, focus, empty/error/disabled states |

### Navigation rules

- **Home:** top bar (wordmark, search field visual, link to UI kit). **No sidebar.** Tool cards are real links.
- **Tool pages:** shared top/sidebar chrome. Sidebar lists all tools with active state. “All tools” / logo returns home.
- Mobile tool pages: sidebar collapses to a drawer; hamburger in chrome; Esc closes; focus trap while open.

## Visual system

### Layout feel (reference-inspired, brand-owned)

Inspired by clean fintech-dashboard spacing (floating shell, soft canvas, pill active nav, generous padding), remapped to DevToolkit branding:

- Page canvas: muted cool gray (`#f4f5f7`)
- Content: floating white shell, large radii (~14–18px), single soft elevation
- Subtle decorative blobs using navy/coral soft tints only (not teal/gold)
- Tool tiles and workspace panels as interactive surfaces, not decorative marketing cards
- Home first viewport: brand + one headline + one supporting line + tool grid (no stats strips)

### Color tokens (CSS variables on `:root`)

| Token | Value | Use |
|-------|--------|-----|
| `--color-canvas` | `#f4f5f7` | Page background |
| `--color-bg` / `--color-surface` | `#ffffff` | Shell, panels |
| `--color-surface-muted` | `#f2f2f2` | Inputs, code washes (aligned with brand site) |
| `--color-border` | `#eeeeee` | Dividers, subtle edges |
| `--color-text` | `#222222` | Body |
| `--color-text-muted` | `#999999` | Hints; never sole carrier of meaning |
| `--color-primary` | `#0c0a5d` | Navy brand, links, active sidebar fill |
| `--color-accent` | `#f39660` | Primary CTAs, highlights |
| `--color-primary-soft` | `rgba(12, 10, 93, 0.05)` | Hover / soft fills |
| `--color-accent-soft` | `rgba(243, 150, 96, 0.125)` | Soft accent fills |
| `--color-focus` | `#0c0a5d` | Focus ring color |

Future themes override the same names (e.g. `[data-theme="dark"]`) without changing component CSS.

### Typography

| Role | Font |
|------|------|
| Wordmark & home display | **DM Serif Display** |
| UI / body | **Inter** |
| Code / JSON / Base64 panes | `--font-mono` system mono stack |

### Spacing, radius, motion

- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`
- Radii: control ~8px; panels/tiles ~14px; shell ~18px; sidebar active = pill
- Shadow: one soft elevation using navy tint — no multi-layer glow
- Motion: 150–200ms for hover/focus; respect `prefers-reduced-motion: reduce`

## Accessibility requirements

- Landmarks: `header`, `nav`, `main`; skip link to `#main`
- Visible focus ring (2px navy + offset) on all interactive elements
- Contrast: body text AA on surfaces; coral buttons use white labels and must meet AA
- Keyboard: complete tab order; drawer focus trap + Esc; sidebar is a list of links
- Forms: visible `<label>` for every control; errors via `aria-invalid` + `aria-describedby`
- UI kit must document default / hover / focus / disabled / error / empty states

## File structure

```
design/
  index.html
  image-compressor.html
  qr-code-generator.html
  json-comparer.html
  text-comparer.html
  base64.html
  ui-kit.html
  assets/
    styles/
      tokens.css
      base.css
      layout.css
      components.css
    scripts/
      nav.js
    images/
  README.md
```

All filenames kebab-case. Open via static files or any local static server. No bundler for the prototype.

## Tool page content (static shells)

Each tool page includes:

1. Shared chrome (header + sidebar with correct active item)
2. Page title + one-line privacy/purpose hint (“stays in your browser”)
3. Representative controls and result regions (placeholders / sample markup)
4. Primary action button styled with `--color-accent`

No requirement that controls perform real work in this phase.

## Success criteria

- Someone can navigate home ↔ every tool ↔ UI kit in a browser without a build step
- Visual language clearly matches sivadass.in colors with the soft shell layout
- Tokens live in one file; components never hard-code brand hex values
- Keyboard and focus behavior demonstrable on UI kit and mobile nav

## Next step

Create an implementation plan (writing-plans) to build the `/design` prototype from this spec.
