# Home Page Quiet Craft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the home page (`/`) to quiet-craft visuals — display hero, soft wash atmosphere, frosted tool tiles — without changing tool pages.

**Architecture:** Keep `HomeLayout` + `HomePage` + `TOOLS` config. Restyle via `brand.css` / `app.css` and simplify `home-page.tsx` markup (drop badges, rename card classes to tiles). No new packages; DM Serif Display is already loaded in `app/index.html`.

**Tech Stack:** React 19, CleanPlate (`Typography`, `Icon`), React Router `Link`, existing CSS tokens, Vitest + Testing Library.

## Global Constraints

- Home page only — do not restyle `ToolLayout`, tool feature pages, or sidebar
- Quiet craft: no borders, drop shadows, Ready/Soon badges, or hover lift on tiles
- Accent `#f39660` on kicker only; primary brand `#0c0a5d` elsewhere
- Kebab-case filenames; CleanPlate props over inline styles (`app/AGENTS.md`)
- Follow `docs/superpowers/specs/2026-08-07-home-page-quiet-craft-design.md`
- Prefer class rename `tool-card-link*` → `tool-tile*`

## File map

| File | Responsibility |
|------|----------------|
| `app/src/pages/home-page.tsx` | Hero + frosted tile grid markup |
| `app/src/pages/home-page.test.tsx` | Assertions for tools, no badges, soon copy, hero classes |
| `app/src/styles/brand.css` | Wash on `.home-shell`, accent token, display headline class |
| `app/src/styles/app.css` | Replace home/tool-card CSS with frosted tile styles |
| `app/src/layouts/home-layout.tsx` | Only if padding/spacing must change (prefer CSS) |

---

### Task 1: Failing tests for quiet-craft home markup

**Files:**
- Modify: `app/src/pages/home-page.test.tsx`
- Modify (later): `app/src/pages/home-page.tsx`

**Interfaces:**
- Consumes: `HomePage`, `TOOLS` via rendered links
- Produces: Tests that encode badge removal, soon text, hero classes, tile class names

- [ ] **Step 1: Extend `home-page.test.tsx` with failing assertions**

Replace/expand the file to:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomePage } from "./home-page";

describe("HomePage", () => {
  function renderHome() {
    return render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  }

  it("lists all tools including PDF compressor", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /image compressor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pdf compressor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /qr code generator/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /qr code reader/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /json comparer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /json visualiser/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /text comparer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /base64/i })).toBeInTheDocument();
  });

  it("uses quiet craft hero: kicker, display headline, short lead", () => {
    renderHome();
    expect(screen.getByText(/client-side/i)).toBeInTheDocument();
    const heading = screen.getByRole("heading", {
      level: 1,
      name: /tools that stay in your browser/i,
    });
    expect(heading).toHaveClass("home__headline");
    expect(screen.getByText(/never uploaded/i)).toBeInTheDocument();
  });

  it("renders frosted tiles without Ready/Soon badges", () => {
    const { container } = renderHome();
    expect(screen.queryByText(/^ready$/i)).not.toBeInTheDocument();
    expect(container.querySelector(".tool-tile")).toBeTruthy();
    expect(container.querySelector(".tool-card-link")).toBeNull();
  });
});
```

Note: If no tools are `coming-soon` in `TOOLS` today, do **not** assert “Soon” unless a soon tool exists. Current `tools.ts` has all `ready` — skip soon-specific assertions unless status changes.

- [ ] **Step 2: Run tests to verify new assertions fail**

Run:

```bash
cd app && npm test -- --run src/pages/home-page.test.tsx
```

Expected: FAIL on missing `home__headline` / `.tool-tile` and/or presence of “Ready” badges.

- [ ] **Step 3: Commit test-only changes**

```bash
git add app/src/pages/home-page.test.tsx
git commit -m "$(cat <<'EOF'
test: specify quiet-craft home page markup expectations

EOF
)"
```

---

### Task 2: Home page markup (hero + frosted tiles)

**Files:**
- Modify: `app/src/pages/home-page.tsx`

**Interfaces:**
- Consumes: `TOOLS` from `../config/tools`, CleanPlate `Typography` + `Icon`, `Link`
- Produces: DOM with `.home__kicker`, `.home__headline`, `.home__lead`, `.tool-tile` / `.tool-tile--soon`

- [ ] **Step 1: Rewrite `home-page.tsx`**

```tsx
import { Icon, Typography } from "cleanplate";
import { Link } from "react-router-dom";
import { TOOLS } from "../config/tools";

export function HomePage() {
  return (
    <div className="home">
      <section aria-labelledby="home-heading">
        <Typography variant="small" margin="0" className="home__kicker">
          Client-side · Private
        </Typography>
        <Typography
          variant="h1"
          margin="t-3"
          id="home-heading"
          className="home__headline"
        >
          Tools that stay in your browser
        </Typography>
        <Typography variant="p" margin="t-3" className="home__lead">
          Compress, compare, encode — never uploaded.
        </Typography>
      </section>

      <section className="home__tools" aria-label="Available tools">
        <div className="tool-grid">
          {TOOLS.map((tool) => {
            const isReady = tool.status === "ready";
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className={isReady ? "tool-tile" : "tool-tile tool-tile--soon"}
              >
                <span className="tool-tile__icon" aria-hidden>
                  <Icon name={tool.icon as never} size="large" />
                </span>
                <Typography variant="h4" margin="t-4">
                  {tool.title}
                </Typography>
                <Typography
                  variant="small"
                  margin="t-2"
                  className="tool-tile__desc"
                >
                  {isReady ? tool.description : "Soon"}
                </Typography>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
```

Remove `Badge` import and all Ready/Soon badge UI. Drop the “Open tool” CTA row to reduce chrome (titles + desc are enough for a quiet launcher).

- [ ] **Step 2: Run home page tests**

Run:

```bash
cd app && npm test -- --run src/pages/home-page.test.tsx
```

Expected: PASS for markup assertions. CSS may still look old until Task 3–4.

- [ ] **Step 3: Commit**

```bash
git add app/src/pages/home-page.tsx
git commit -m "$(cat <<'EOF'
refactor: simplify home tiles and drop status badges

EOF
)"
```

---

### Task 3: Atmosphere + hero tokens in `brand.css`

**Files:**
- Modify: `app/src/styles/brand.css`

**Interfaces:**
- Consumes: existing `--primary-brand`
- Produces: `--home-accent`, wash on `.home-shell`, `.home__headline` / kicker color

- [ ] **Step 1: Update `brand.css`**

Keep existing `.brand-wordmark` / `.site-header` rules. Change/add:

```css
:root {
  --primary-brand: #0c0a5d;
  --home-accent: #f39660;
}

/* ... existing brand-wordmark / site-header rules unchanged ... */

.home-shell {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 100% -10%, rgba(243, 150, 96, 0.12), transparent 55%),
    radial-gradient(ellipse 70% 45% at -5% 100%, rgba(12, 10, 93, 0.08), transparent 50%),
    linear-gradient(165deg, #f7f7fa 0%, #eef0f6 45%, #f8f4f0 100%);
}

.home-shell__main {
  padding-bottom: var(--space-8);
}

.home {
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;
}

.home__kicker {
  color: var(--home-accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem !important;
}

.home__headline {
  font-family: "DM Serif Display", Georgia, serif !important;
  color: var(--primary-brand);
  letter-spacing: -0.025em;
  line-height: 1.15;
  font-weight: 400 !important;
}

.home__lead {
  color: var(--text-subtle);
  font-size: 1.0625rem;
  line-height: 1.55;
  max-width: 36rem;
}
```

Remove duplicate `.home__kicker` / `.home__lead` from `app.css` in Task 4 (avoid split sources of truth — hero chrome lives in `brand.css`).

- [ ] **Step 2: Visual check**

Run:

```bash
cd app && npm run dev
```

Open `/`. Confirm wash + serif headline + orange kicker. Tiles may still look like old cards until Task 4.

- [ ] **Step 3: Commit**

```bash
git add app/src/styles/brand.css
git commit -m "$(cat <<'EOF'
style: add home wash atmosphere and display hero type

EOF
)"
```

---

### Task 4: Frosted tile styles in `app.css`

**Files:**
- Modify: `app/src/styles/app.css` (home / tool-card block at top of file, ~lines 1–119)

**Interfaces:**
- Consumes: `.tool-tile` markup from Task 2
- Produces: frosted tile look, no border/shadow/lift; soon opacity; focus ring

- [ ] **Step 1: Replace home card CSS**

Delete the old `.home__kicker`, `.home__lead`, and entire `.tool-card-link*` block (through reduced-motion rules for those cards). Keep `.home__tools` and `.tool-grid` breakpoints. Insert:

```css
.home__tools {
  margin-top: var(--space-8);
}

.tool-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .tool-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .tool-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tool-tile {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  padding: var(--space-5);
  border-radius: var(--radius-x-large);
  background: rgba(255, 255, 255, 0.72);
  border: none;
  box-shadow: none;
  transition: background 160ms ease;
}

.tool-tile:hover {
  background: rgba(255, 255, 255, 0.9);
}

.tool-tile:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--white),
    0 0 0 4px var(--primary-brand);
}

.tool-tile--soon {
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.5);
}

.tool-tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-large);
  background: color-mix(in srgb, var(--primary-brand) 8%, transparent);
  color: var(--primary-brand);
}

.tool-tile__desc {
  color: var(--text-muted);
  flex: 1;
}

@media (prefers-reduced-motion: reduce) {
  .tool-tile {
    transition: none;
  }
}
```

Do **not** add `transform: translateY` on hover.

- [ ] **Step 2: Grep for leftover card class names**

Run:

```bash
rg "tool-card-link" app/src
```

Expected: no matches.

- [ ] **Step 3: Run tests + typecheck**

```bash
cd app && npm test -- --run src/pages/home-page.test.tsx && npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Manual visual QA**

With `npm run dev`, confirm:

- Soft wash (not flat gray-50)
- Serif H1, accent kicker
- Frosted tiles, no borders/shadows/badges
- Hover brightens only (no lift)
- Focus ring visible via keyboard
- Tool pages (`/tools/image-compressor`) look unchanged

- [ ] **Step 5: Commit**

```bash
git add app/src/styles/app.css
git commit -m "$(cat <<'EOF'
style: frosted home tool tiles without card chrome

EOF
)"
```

---

### Task 5: Final verification

**Files:** none required unless fixes

- [ ] **Step 1: Full app test suite**

```bash
cd app && npm test -- --run && npm run typecheck && npm run lint
```

Expected: all green (fix any lint issues introduced).

- [ ] **Step 2: Spec checklist**

Confirm against `docs/superpowers/specs/2026-08-07-home-page-quiet-craft-design.md`:

- [ ] Atmosphere wash on home shell
- [ ] Display headline + accent kicker + short lead
- [ ] Frosted tiles, no badges/borders/shadows/lift
- [ ] Tool pages unchanged
- [ ] `prefers-reduced-motion` respected

- [ ] **Step 3: Commit any leftover fixes** (only if needed)

```bash
git add -A app/src
git commit -m "$(cat <<'EOF'
fix: polish home quiet-craft residual issues

EOF
)"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Soft wash atmosphere | Task 3 |
| Hero A (serif, accent kicker, short lead) | Tasks 2–3 |
| Frosted tiles, no badges | Tasks 2, 4 |
| No hover lift; focus ring | Task 4 |
| Home-only scope | Global constraints + Task 4 QA |
| Accent only on kicker | Task 3 |
| Accessibility (Soon text if soon tools) | Task 2 (`Soon` for non-ready) |
| Tests | Tasks 1, 5 |

No placeholders remaining. Class names consistent: `tool-tile*`, `home__headline`.
