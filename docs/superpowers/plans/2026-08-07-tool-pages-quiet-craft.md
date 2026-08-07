# Tool Pages Quiet Craft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all tool routes into the home page’s quiet-craft language via shared wash chrome, frosted sidebar, shared `ToolPageHeader` / `ToolSurface`, and workspace-rhythm layouts for image + PDF compressor.

**Architecture:** Extend `brand.css` / `app.css` with shared wash + frosted tokens used by `.tool-shell`. Add two small presentational components under `app/src/components/`. Migrate every feature `*-page.tsx` off CleanPlate `PageHeader` and bordered `Container`s. Image and PDF compressor move Compress CTA next to the file step; other tools keep header CTAs.

**Tech Stack:** React 19, TypeScript, Vite, React Router 7, CleanPlate `^0.3.36`, Vitest, Testing Library. Spec: `docs/superpowers/specs/2026-08-07-tool-pages-quiet-craft-design.md`.

## Global Constraints

- Filenames: **kebab-case** only (repo Cursor rule); exported component names remain PascalCase
- UI via **CleanPlate**; do not invent parallel form controls; read `app/node_modules/cleanplate/docs/<Component>.md` before inventing props
- CleanPlate spacing: suffix-only (`margin="b-2"`) — never `m-` / `p-` prefixes
- Quiet craft: wash + frosted surfaces; **no** drop shadows / card lift / purple glow / solid navy sidebar pills
- Accent kicker color: `#f39660` (`--home-accent`); primary: `#0c0a5d` (`--primary-brand`)
- Display font: **DM Serif Display** for tool titles
- Preserve JSON visualiser viewport-lock CSS (`.tool-shell:has(.json-visualiser)`)
- Do not change compression/encode/compare algorithms — presentation + CTA placement only
- Prefer stable selectors (`.tool-shell aside`, `[class*="active"]` attribute substring) over hashed CleanPlate module class names

---

## File map

| File | Responsibility |
|------|----------------|
| `app/src/styles/brand.css` | Shared wash variables; `.tool-shell` atmosphere; frosted sidebar + transparent header chrome |
| `app/src/styles/app.css` | `.tool-page-header*`, `.tool-surface`, `.tool-primary-step`, preview/options quieting; keep existing tool-specific layouts |
| `app/src/components/tool-page-header.tsx` | Shared tool page header (kicker, display title, subtitle, optional CTA) |
| `app/src/components/tool-page-header.test.tsx` | Header smoke tests |
| `app/src/components/tool-surface.tsx` | Frosted panel wrapper |
| `app/src/components/tool-surface.test.tsx` | Surface smoke tests |
| `app/src/layouts/tool-layout.tsx` | Minor class hooks only if needed |
| `app/src/features/**/*-page.tsx` (8 pages) | Adopt header + surfaces; image/PDF workspace rhythm |
| `app/src/features/**/*-page.test.tsx` | Update assertions for header/CTA structure |

---

### Task 1: Shared wash tokens + tool-shell chrome CSS

**Files:**
- Modify: `app/src/styles/brand.css`
- Modify: `app/src/styles/app.css` (only if tool-shell container needs transparency tweaks)
- Modify: `app/src/layouts/tool-layout.tsx` (only if an extra class is required)

**Interfaces:**
- Consumes: existing `.home-shell` wash pattern in `brand.css`
- Produces: `.tool-shell` uses shared wash; frosted sidebar via `.tool-shell aside[aria-label="Main navigation"]`; header sits on wash

- [ ] **Step 1: Extract shared wash tokens and apply to `.tool-shell`**

In `app/src/styles/brand.css`, refactor so home and tools share the same wash (avoid duplicating three gradient stops). Example shape:

```css
:root {
  --primary-brand: #0c0a5d;
  --home-accent: #f39660;
  --surface-frosted: rgba(255, 255, 255, 0.72);
  --surface-frosted-hover: rgba(255, 255, 255, 0.9);
  --canvas-wash:
    radial-gradient(ellipse 80% 50% at 100% -10%, rgba(243, 150, 96, 0.12), transparent 55%),
    radial-gradient(ellipse 70% 45% at -5% 100%, rgba(12, 10, 93, 0.08), transparent 50%),
    linear-gradient(165deg, #f7f7fa 0%, #eef0f6 45%, #f8f4f0 100%);
}

.home-shell,
.tool-shell {
  min-height: 100vh;
  background: var(--canvas-wash);
}

.home-shell {
  /* keep existing min-height if already set; remove duplicate gradient body */
}
```

Update `.home-shell` to use `var(--canvas-wash)` instead of inlining the same gradients.

- [ ] **Step 2: Frosted sidebar + quiet active state**

Append to `brand.css` (or `app.css` if preferred for layout overrides):

```css
.tool-shell aside[aria-label="Main navigation"] {
  background: var(--surface-frosted);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-inline-end: none;
  box-shadow: none;
}

/* CleanPlate MenuList uses hashed active classes — match by substring */
.tool-shell aside[aria-label="Main navigation"] [class*="active"] {
  background: color-mix(in srgb, var(--primary-brand) 12%, transparent) !important;
  color: var(--primary-brand) !important;
  border-radius: var(--radius-large, 12px);
  font-weight: 600;
}

.tool-shell aside[aria-label="Main navigation"] [class*="active"]:focus-visible,
.tool-shell aside[aria-label="Main navigation"] button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--white, #fff),
    0 0 0 4px var(--primary-brand);
}
```

If the live DOM uses a different `aria-label`, adjust to the actual attribute after checking in the browser / React tree. Do **not** hardcode fragile full hashed class names like `.sidebar-YXG-Q`.

- [ ] **Step 3: Transparent tool header bar**

```css
.tool-shell .site-header,
.tool-shell .site-header > * {
  background: transparent !important;
  box-shadow: none;
  border-bottom: none;
}
```

If CleanPlate `Header` still paints an opaque white layer, target the nearest child under `.tool-shell` that owns the background (inspect once; keep selectors structural).

- [ ] **Step 4: Ensure main content does not reintroduce a flat white slab**

In `app.css`, confirm `.tool-shell-container` / content wrappers do not set `background: white`. If they do, remove it. Keep JSON visualiser lock rules intact.

- [ ] **Step 5: Manual smoke (dev)**

Run: `cd app && npm run dev`  
Open any `/tools/*` route. Expected: wash behind shell, frosted sidebar, no solid navy active pill, header not a stark white bar. Home still shows the same wash.

- [ ] **Step 6: Commit**

```bash
git add app/src/styles/brand.css app/src/styles/app.css app/src/layouts/tool-layout.tsx
git commit -m "$(cat <<'EOF'
style(tools): share wash canvas and frosted sidebar chrome

EOF
)"
```

---

### Task 2: `ToolPageHeader` component

**Files:**
- Create: `app/src/components/tool-page-header.tsx`
- Create: `app/src/components/tool-page-header.test.tsx`

**Interfaces:**
- Consumes: CleanPlate `Typography`; CSS classes from Task 3 styles (header CSS may land in this task)
- Produces:

```tsx
export type ToolPageHeaderProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  primaryCta?: React.ReactNode;
  className?: string;
};

export function ToolPageHeader(props: ToolPageHeaderProps): JSX.Element;
```

Default kicker when omitted on privacy tools is decided by callers (pass `"Client-side · Private"` explicitly from pages).

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolPageHeader } from "./tool-page-header";

describe("ToolPageHeader", () => {
  it("renders kicker, display title, subtitle, and optional CTA", () => {
    render(
      <ToolPageHeader
        kicker="Client-side · Private"
        title="Image compressor"
        subtitle="Compress locally."
        primaryCta={<button type="button">Compress</button>}
      />
    );
    expect(screen.getByText(/client-side/i)).toHaveClass("tool-page-header__kicker");
    const heading = screen.getByRole("heading", {
      level: 1,
      name: /image compressor/i,
    });
    expect(heading).toHaveClass("tool-page-header__title");
    expect(screen.getByText(/compress locally/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compress/i })).toBeInTheDocument();
  });

  it("omits CTA row actions when primaryCta is absent", () => {
    render(<ToolPageHeader title="Base64" subtitle="Encode text." />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test -- src/components/tool-page-header.test.tsx`  
Expected: FAIL (module not found / component missing)

- [ ] **Step 3: Implement component + CSS**

`app/src/components/tool-page-header.tsx`:

```tsx
import { Typography } from "cleanplate";
import type { ReactNode } from "react";

export type ToolPageHeaderProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  primaryCta?: ReactNode;
  className?: string;
};

export function ToolPageHeader({
  title,
  subtitle,
  kicker,
  primaryCta,
  className,
}: ToolPageHeaderProps) {
  const rootClass = ["tool-page-header", className].filter(Boolean).join(" ");

  return (
    <header className={rootClass}>
      <div className="tool-page-header__text">
        {kicker ? (
          <Typography variant="small" margin="0" className="tool-page-header__kicker">
            {kicker}
          </Typography>
        ) : null}
        <Typography
          variant="h1"
          margin={kicker ? "t-3" : "0"}
          className="tool-page-header__title"
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="p" margin="t-2" className="tool-page-header__subtitle">
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {primaryCta ? (
        <div className="tool-page-header__cta">{primaryCta}</div>
      ) : null}
    </header>
  );
}
```

Add to `app/src/styles/app.css` (or `brand.css` if co-locating type tokens):

```css
.tool-page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.tool-page-header__kicker {
  color: var(--home-accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem !important;
}

.tool-page-header__title {
  font-family: "DM Serif Display", Georgia, serif !important;
  color: var(--primary-brand);
  letter-spacing: -0.025em;
  line-height: 1.15;
  font-weight: 400 !important;
}

.tool-page-header__subtitle {
  color: var(--text-subtle);
  max-width: 40rem;
  line-height: 1.5;
}

.tool-page-header__cta {
  flex-shrink: 0;
  margin-inline-start: auto;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npm test -- src/components/tool-page-header.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/components/tool-page-header.tsx app/src/components/tool-page-header.test.tsx app/src/styles/app.css app/src/styles/brand.css
git commit -m "$(cat <<'EOF'
feat(tools): add ToolPageHeader for quiet craft titles

EOF
)"
```

---

### Task 3: `ToolSurface` component

**Files:**
- Create: `app/src/components/tool-surface.tsx`
- Create: `app/src/components/tool-surface.test.tsx`
- Modify: `app/src/styles/app.css`

**Interfaces:**
- Consumes: frosted CSS variables from Task 1
- Produces:

```tsx
export type ToolSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  padding?: string; // optional; prefer class or CleanPlate-free padding via CSS default
};

export function ToolSurface(props: ToolSurfaceProps): JSX.Element;
```

Use a plain `div` with class `tool-surface` (do not wrap CleanPlate `Container showBorder`).

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolSurface } from "./tool-surface";

describe("ToolSurface", () => {
  it("renders children inside a frosted surface", () => {
    const { container } = render(
      <ToolSurface>
        <p>Original</p>
      </ToolSurface>
    );
    expect(screen.getByText("Original")).toBeInTheDocument();
    expect(container.querySelector(".tool-surface")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test -- src/components/tool-surface.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement component + CSS**

```tsx
import type { ReactNode } from "react";

export type ToolSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function ToolSurface({ children, className }: ToolSurfaceProps) {
  const rootClass = ["tool-surface", className].filter(Boolean).join(" ");
  return <div className={rootClass}>{children}</div>;
}
```

```css
.tool-surface {
  background: var(--surface-frosted);
  border: none;
  box-shadow: none;
  border-radius: var(--radius-x-large, 16px);
  padding: var(--space-4);
  transition: background 160ms ease;
}

.tool-surface:hover {
  background: var(--surface-frosted-hover);
}

@media (prefers-reduced-motion: reduce) {
  .tool-surface {
    transition: none;
  }
}
```

Do **not** add `translateY` on hover.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npm test -- src/components/tool-surface.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/components/tool-surface.tsx app/src/components/tool-surface.test.tsx app/src/styles/app.css
git commit -m "$(cat <<'EOF'
feat(tools): add ToolSurface frosted panel primitive

EOF
)"
```

---

### Task 4: Adopt `ToolPageHeader` on all tool pages (keep existing CTA placement)

**Files:**
- Modify: all eight  
  `app/src/features/image-compressor/image-compressor-page.tsx`  
  `app/src/features/pdf-compressor/pdf-compressor-page.tsx`  
  `app/src/features/base64/base64-page.tsx`  
  `app/src/features/qr-code-generator/qr-code-generator-page.tsx`  
  `app/src/features/qr-decoder/qr-decoder-page.tsx`  
  `app/src/features/json-comparer/json-comparer-page.tsx`  
  `app/src/features/json-visualiser/json-visualiser-page.tsx`  
  `app/src/features/text-comparer/text-comparer-page.tsx`
- Modify: corresponding `*-page.test.tsx` only if imports/assertions break

**Interfaces:**
- Consumes: `ToolPageHeader` from `../../components/tool-page-header` (adjust relative depth per feature folder — always `../../components/tool-page-header`)
- Produces: no page still imports CleanPlate `PageHeader`

- [ ] **Step 1: Replace PageHeader on each page**

For each page, remove `PageHeader` from the CleanPlate import and add:

```tsx
import { ToolPageHeader } from "../../components/tool-page-header";
```

Replace usage pattern:

```tsx
<ToolPageHeader
  kicker="Client-side · Private"
  title="…" // existing title string
  subtitle="…" // existing subtitle string
  primaryCta={/* same node as before, or omit if page had none */}
/>
```

Apply to all eight. For image + PDF compressor, **still keep** `primaryCta` in the header for this task (workspace move is Task 6/7) so behavior stays green mid-migration.

JSON visualiser has no `primaryCta` today — omit the prop.

- [ ] **Step 2: Run all page tests**

Run: `cd app && npm test -- src/features`  
Expected: PASS (titles still found via text / roles)

- [ ] **Step 3: Commit**

```bash
git add app/src/features
git commit -m "$(cat <<'EOF'
refactor(tools): replace PageHeader with ToolPageHeader

EOF
)"
```

---

### Task 5: Adopt `ToolSurface` for bordered result/preview panes

**Files:**
- Modify pages that use `Container showBorder` for results/previews:  
  image-compressor, pdf-compressor, qr-code-generator, qr-decoder, json-comparer, text-comparer  
  (Base64 / JSON visualiser: only if bordered panes exist — skip if not)
- Modify: tests only if needed

**Interfaces:**
- Consumes: `ToolSurface`
- Produces: no tool result/preview pane uses `showBorder` for chrome

- [ ] **Step 1: Swap bordered Containers**

Replace:

```tsx
<Container showBorder padding="4" margin="0" className="…">
  …
</Container>
```

with:

```tsx
<ToolSurface className="…">
  …
</ToolSurface>
```

Preserve existing `className` values (`qr-preview`, `json-result`, `text-result`, etc.) so tool-specific CSS still applies.

Keep outer layout `Container display="block"` wrappers that are borderless layout-only if still useful; or replace with a plain `div` when they only set margin.

- [ ] **Step 2: Run feature tests**

Run: `cd app && npm test -- src/features`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/src/features
git commit -m "$(cat <<'EOF'
refactor(tools): use ToolSurface for frosted result panes

EOF
)"
```

---

### Task 6: Image compressor workspace rhythm

**Files:**
- Modify: `app/src/features/image-compressor/image-compressor-page.tsx`
- Modify: `app/src/features/image-compressor/image-compressor-page.test.tsx`
- Modify: `app/src/styles/app.css` (`.tool-primary-step`)

**Interfaces:**
- Consumes: `ToolPageHeader` (no `primaryCta`), `ToolSurface`, existing `useImageCompressor`
- Produces: Compress button co-located with file step

- [ ] **Step 1: Update failing/expanded test first**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageCompressorPage } from "./image-compressor-page";

describe("ImageCompressorPage", () => {
  it("renders quiet craft header and compress action with the file step", () => {
    const { container } = render(<ImageCompressorPage />);
    expect(screen.getByText(/client-side/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /image compressor/i })
    ).toHaveClass("tool-page-header__title");
    const compress = screen.getByRole("button", { name: /compress/i });
    expect(compress).toBeDisabled();
    expect(container.querySelector(".tool-primary-step")).toContainElement(compress);
    expect(container.querySelector(".tool-page-header__cta")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test -- src/features/image-compressor/image-compressor-page.test.tsx`  
Expected: FAIL (Compress still in header / missing `.tool-primary-step`)

- [ ] **Step 3: Restructure page markup**

1. `ToolPageHeader` with kicker + title + subtitle — **no** `primaryCta`.
2. Wrap file control + Compress in:

```tsx
<div className="tool-primary-step">
  <div className="tool-primary-step__input">
    <FormControls.File /* existing props */ />
    <Typography variant="small" margin="0" className="tool-hint">
      PNG, JPEG, WebP, or GIF up to 10 MB. …
    </Typography>
  </div>
  <div className="tool-primary-step__action">
    <Button
      variant="solid"
      isLoading={isCompressing}
      isDisabled={!file || isCompressing}
      onClick={() => void compress()}
    >
      Compress
    </Button>
  </div>
</div>
```

3. Options row unchanged functionally; keep quieter (no bordered wrapper).
4. Preview panes already `ToolSurface` from Task 5.

Add CSS:

```css
.tool-primary-step {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  align-items: start;
  margin-top: var(--space-4);
}

@media (min-width: 768px) {
  .tool-primary-step {
    grid-template-columns: 1fr auto;
    align-items: end;
  }
}

.tool-primary-step__action {
  display: flex;
  justify-content: flex-start;
}

@media (min-width: 768px) {
  .tool-primary-step__action {
    padding-bottom: 0.5rem; /* optically align with file control */
  }
}

.tool-hint {
  color: var(--text-subtle);
}
```

Optional: soften CleanPlate file card chrome under `.tool-shell` with a light override (no hard border) — keep YAGNI if the frosted page already reads well.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npm test -- src/features/image-compressor/image-compressor-page.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/features/image-compressor app/src/styles/app.css
git commit -m "$(cat <<'EOF'
feat(image-compressor): move Compress into primary file step

EOF
)"
```

---

### Task 7: PDF compressor workspace rhythm

**Files:**
- Modify: `app/src/features/pdf-compressor/pdf-compressor-page.tsx`
- Modify: `app/src/features/pdf-compressor/pdf-compressor-page.test.tsx`
- Reuse: `.tool-primary-step` CSS from Task 6

**Interfaces:**
- Consumes: same primary-step pattern as image compressor
- Produces: Compress/Cancel co-located with file step; header has no CTA

- [ ] **Step 1: Update test**

Mirror image compressor assertions: kicker present, title has `tool-page-header__title`, Compress (or Cancel when compressing — default idle state) lives inside `.tool-primary-step`, header CTA absent.

Read the existing `pdf-compressor-page.test.tsx` and extend it rather than deleting coverage.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd app && npm test -- src/features/pdf-compressor/pdf-compressor-page.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Restructure page**

Same as image: remove header `primaryCta`; place Compress/Cancel button group in `.tool-primary-step__action` beside the PDF file control. Keep mode/preset options secondary; keep frosted preview panes.

When `isCompressing`, show Cancel in the action slot (same behavior as today’s header CTA swap).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd app && npm test -- src/features/pdf-compressor/pdf-compressor-page.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/features/pdf-compressor
git commit -m "$(cat <<'EOF'
feat(pdf-compressor): align Compress CTA with file step

EOF
)"
```

---

### Task 8: Polish, typecheck, full suite

**Files:**
- Modify: `app/src/styles/app.css` / `brand.css` as needed for file-drop quieting, options spacing, focus rings
- Modify: any remaining test flakes

**Interfaces:**
- Consumes: all prior tasks
- Produces: green `npm test` + `npm run typecheck`; visual quiet craft across tools

- [ ] **Step 1: Quiet helper copy + options spacing**

Ensure helper/hint typography under file controls uses muted color (`.tool-hint` or `Typography` + class). Confirm `.options-row` has no bordered parent. Add `prefers-reduced-motion` coverage for any new transitions beyond Task 3.

- [ ] **Step 2: Full verification**

Run:

```bash
cd app && npm test && npm run typecheck
```

Expected: all tests PASS; typecheck exits 0.

- [ ] **Step 3: Manual checklist**

- Home still quiet craft  
- `/tools/image-compressor`: wash, frosted sidebar, display title, Compress by file, frosted previews  
- `/tools/pdf-compressor`: same rhythm  
- One non-compress tool (e.g. Base64): shared header + chrome, CTA still in header  
- JSON visualiser: still fills viewport / internal scroll  

- [ ] **Step 4: Commit**

```bash
git add app/src/styles app/src/features app/src/components
git commit -m "$(cat <<'EOF'
style(tools): quiet craft polish for tool pages

EOF
)"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Shared wash on `.tool-shell` | 1 |
| Frosted sidebar, quiet active well | 1 |
| Header on wash (not stark bar) | 1 |
| `ToolPageHeader` (kicker, display title, subtitle, CTA slot) | 2, 4 |
| `ToolSurface` frosted panes | 3, 5 |
| All 8 tools adopt template | 4, 5 |
| Image compressor workspace rhythm | 6 |
| PDF compressor aligned | 7 |
| Hover without lift; reduced motion | 3, 8 |
| JSON visualiser viewport lock preserved | 1, 8 |
| No algorithm changes | all (presentation only) |
| A11y focus rings | 1, 3, 8 |

## Placeholder / consistency check

- Component names stable: `ToolPageHeader`, `ToolSurface`, classes `tool-page-header*`, `tool-surface`, `tool-primary-step`
- Import path from features: `../../components/tool-page-header` and `../../components/tool-surface`
- No TBD/TODO left in steps
