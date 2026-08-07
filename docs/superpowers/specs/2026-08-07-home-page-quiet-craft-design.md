# Home Page Quiet Craft — Design Spec

**Date:** 2026-08-07  
**Status:** Approved for implementation  
**Scope:** Visual and structural refresh of the home page (`/`) only. Tool pages and shared tool chrome are out of scope unless noted.

## Goal

Make the home page feel **premium through quiet craft** — refined atmosphere, type, and tile treatment — while remaining a **fast tool launcher** (Linear / Raycast energy), not a marketing landing page.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Premium meaning | Quiet craft — restraint over theater |
| Scope | Soft restructure — new hero rhythm + grid treatment, same launcher job |
| Tool presentation | Light tiles — flatter, quieter grid |
| Hero rhythm | **A — Display headline** (serif H1, accent kicker, short lead; brand stays in header) |
| Tile treatment | **A — Frosted tiles** (translucent white tiles on soft wash) |
| Full composition | Approved (Y) |

## Out of scope

- Redesigning tool pages, sidebar, or `ToolLayout`
- Restoring the floating prototype shell (`shell--blob` card frame)
- Dense list/row launcher or unified divider panel
- Search, filters, categories, or featured-tool ranking
- Dark mode
- New tools or status-model changes beyond presentation

## Current problems (why)

- Flat `gray-50` canvas and bordered white cards read as generic SaaS catalog
- Ready/Soon badges and equal elevation create noise and no hierarchy
- Brand wordmark is header-only; hero type does not use the display face
- Design prototype atmosphere (wash, accent kicker) was lost in the React home

## Visual design

### Atmosphere

- Home shell background: soft diagonal wash — cool indigo-gray into a faint warm edge (not a flat single fill; not purple glow).
- No floating bordered page shell; content sits directly on the wash.
- Keep content max-width ~1120px; generous top/bottom padding so the hero breathes before the grid.

### Hero

Structure (top → bottom):

1. **Kicker** — `Client-side · Private` (or equivalent). Uppercase, tracked, small. Color: warm accent `#f39660` / design token accent (not primary indigo).
2. **Headline** — Existing product line *Tools that stay in your browser*. Use **DM Serif Display** (same family as brand wordmark). Primary indigo `#0c0a5d`. Tighter letter-spacing; clear size step above tool titles.
3. **Lead** — One short sentence. Muted text. Prefer shortened copy in the spirit of *Compress, compare, encode — never uploaded.* (exact string may stay current if already close).

Header brand wordmark unchanged in role (nav identity). No second brand lockup in the hero.

### Tool grid — frosted tiles

- Responsive grid: 1 → 2 → 3 columns (same breakpoints as today: ~640 / ~960).
- Each tool is an interactive tile (`Link`):
  - Soft translucent white fill on the wash (`rgba(255,255,255,~0.72)` or tokenized equivalent)
  - **No** border, **no** drop shadow, **no** Ready/Soon `Badge`
  - Icon in a quiet soft indigo well
  - Title (semibold sans) + short description (muted)
  - Optional quiet CTA text (“Open tool”) without competing chrome; may omit arrow-heavy treatment if it adds noise
- **Coming soon** tools: reduced opacity + “Soon” as muted copy (not a badge). Still keyboard-focusable if they remain links to coming-soon routes.

### Interaction / motion

- Hover: slightly brighter / more opaque tile fill; **no** `translateY` lift.
- Focus-visible: soft indigo ring (accessible), not shadow stacking.
- Respect `prefers-reduced-motion: reduce` (disable non-essential transitions).

### Color & type tokens (home-scoped)

Introduce or reuse CSS variables on the home surface (prefer `brand.css` / home selectors so tool pages stay untouched):

| Token / role | Value / source |
|--------------|----------------|
| Primary brand | `#0c0a5d` (existing) |
| Accent (kicker only) | `#f39660` (from design prototype) |
| Display font | `DM Serif Display` (already used on wordmark — ensure loaded for home H1) |
| Canvas wash | Soft multi-stop gradient as above |

Avoid purple-on-white AI clichés; keep the existing navy + warm accent system.

## UX / content rules

1. First viewport job: identify product tone + scan tools quickly.
2. One composition: header + hero + grid — no stats strips, promo chips, or secondary marketing blocks.
3. Privacy is stated once (kicker + short lead), not repeated as badges on every tile.
4. All current tools remain equally discoverable (no featured row in this pass).

## Implementation sketch

Touch only home-related UI/styles:

| Area | Change |
|------|--------|
| `home-page.tsx` | Remove `Badge`; simplify tile markup (icon, title, desc, soon state via class); apply display class on H1 / kicker |
| `home-layout.tsx` / `brand.css` | Atmosphere on `.home-shell`; spacing rhythm |
| `app.css` (home / tool-card blocks) | Replace bordered card styles with frosted tile styles; hover/focus; soon opacity |
| Fonts | Confirm DM Serif Display available for home headline (already used for wordmark) |

CleanPlate: keep `Typography`, `Icon`, `Link` pattern; do not invent new design-system components for this pass.

### Suggested class rename (optional but preferred)

Migrate `tool-card-link*` → `tool-tile*` (or keep names and restyle) so CSS matches the flatter metaphor. Either is fine if diffs stay readable.

## Accessibility

- Maintain skip link / main landmark behavior.
- Focus rings must remain visible on tiles.
- Soon state must not rely on opacity alone for meaning — keep visible “Soon” text.
- Color contrast: indigo on wash and muted description on frosted tiles must meet WCAG AA for body/UI text.

## Success criteria

- Home feels calmer and more intentional than bordered white cards on flat gray.
- Scanning tools is as fast or faster (less chrome).
- Brand accent + display type create craft without becoming a long landing page.
- Tool pages visually unchanged.

## Non-goals / YAGNI

- Animation beyond subtle hover/focus
- Parallax blobs or heavy illustration
- Search in header for this pass
