# DevToolkit Design Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clickable static HTML/CSS prototype under `/design` that locks DevToolkit layout, brand tokens, hybrid navigation, and accessibility patterns.

**Architecture:** Plain multi-page HTML with shared CSS layers (`tokens` → `base` → `layout` → `components`) and one small `nav.js` for the mobile drawer. No bundler. Home has no sidebar; tool pages share header + pill sidebar chrome. All brand colors come only from CSS variables in `tokens.css`.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS, Google Fonts (Inter + DM Serif Display), local static server for preview.

## Global Constraints

- Product name in UI: **DevToolkit**
- Filenames: **kebab-case** only
- Brand colors from sivadass.in: primary `#0c0a5d`, accent `#f39660`, text `#222222`, muted `#999999`, surface muted `#f2f2f2`, border `#eeeeee`, canvas `#f4f5f7`
- Light theme only; do not hard-code hex in components — use tokens
- Soft floating shell layout (muted canvas, white shell, pill active nav, radii ~14–18px)
- No real tool logic (compression, QR, diff, Base64) — static shells only
- Spec source of truth: `docs/superpowers/specs/2026-08-04-devtoolkit-design-prototype.md`
- Prototype lives under `design/` exactly as specified in the spec file structure

---

## File map

| File | Responsibility |
|------|----------------|
| `design/assets/styles/tokens.css` | `:root` design tokens only |
| `design/assets/styles/base.css` | Reset, fonts, typography, skip link, focus, reduced motion |
| `design/assets/styles/layout.css` | Canvas, shell, header, home grid, tool sidebar/drawer |
| `design/assets/styles/components.css` | Buttons, inputs, tool cards, panels, alerts, UI kit demos |
| `design/assets/scripts/nav.js` | Mobile drawer open/close, focus trap, Esc |
| `design/index.html` | Home |
| `design/image-compressor.html` | Tool shell |
| `design/qr-code-generator.html` | Tool shell |
| `design/json-comparer.html` | Tool shell (canonical tool chrome reference) |
| `design/text-comparer.html` | Tool shell |
| `design/base64.html` | Tool shell |
| `design/ui-kit.html` | Component states reference |
| `design/README.md` | How to view the prototype |

---

### Task 1: Design tokens

**Files:**
- Create: `design/assets/styles/tokens.css`

**Interfaces:**
- Consumes: none
- Produces: CSS custom properties on `:root` listed below (names must not change in later tasks)

- [ ] **Step 1: Create `design/assets/styles/tokens.css`**

```css
:root {
  /* Color */
  --color-canvas: #f4f5f7;
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-surface-muted: #f2f2f2;
  --color-border: #eeeeee;
  --color-text: #222222;
  --color-text-muted: #999999;
  --color-primary: #0c0a5d;
  --color-accent: #f39660;
  --color-primary-soft: rgba(12, 10, 93, 0.05);
  --color-accent-soft: rgba(243, 150, 96, 0.125);
  --color-focus: #0c0a5d;
  --color-on-accent: #ffffff;
  --color-on-primary: #ffffff;

  /* Typography */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-display: "DM Serif Display", Georgia, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Radii */
  --radius-control: 8px;
  --radius-panel: 14px;
  --radius-shell: 18px;
  --radius-pill: 999px;

  /* Elevation & motion */
  --shadow-shell: 0 8px 30px rgba(12, 10, 93, 0.06);
  --motion-fast: 150ms ease;
  --motion-base: 200ms ease;

  /* Layout */
  --sidebar-width: 240px;
  --header-height: 64px;
  --content-max: 1100px;
}
```

- [ ] **Step 2: Verify token file**

Run:

```bash
rg -n "--color-primary|--color-accent|--color-canvas" design/assets/styles/tokens.css
```

Expected: matches for `#0c0a5d`, `#f39660`, `#f4f5f7`.

- [ ] **Step 3: Commit**

```bash
git add design/assets/styles/tokens.css
git commit -m "feat(design): add DevToolkit design tokens"
```

---

### Task 2: Base styles (typography & a11y primitives)

**Files:**
- Create: `design/assets/styles/base.css`

**Interfaces:**
- Consumes: all tokens from Task 1
- Produces: global element defaults; `.skip-link`; `:focus-visible` ring; `prefers-reduced-motion` rule

- [ ] **Step 1: Create `design/assets/styles/base.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  color-scheme: light;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-canvas);
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-display);
  font-weight: 400;
  color: var(--color-primary);
  line-height: 1.25;
}

h1 {
  font-size: clamp(1.75rem, 2vw + 1rem, 2.25rem);
  margin: 0 0 var(--space-3);
}

h2 {
  font-size: 1.5rem;
  margin: 0 0 var(--space-3);
}

h3 {
  font-size: 1.25rem;
  margin: 0 0 var(--space-2);
}

p {
  margin: 0 0 var(--space-4);
}

a {
  color: var(--color-primary);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

a:hover {
  color: var(--color-accent);
}

img {
  max-width: 100%;
  height: auto;
}

code,
pre,
.font-mono {
  font-family: var(--font-mono);
}

.skip-link {
  position: absolute;
  left: var(--space-4);
  top: -100px;
  z-index: 1000;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-control);
  background: var(--color-primary);
  color: var(--color-on-primary);
  text-decoration: none;
}

.skip-link:focus {
  top: var(--space-4);
}

:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Verify a11y primitives exist**

Run:

```bash
rg -n "skip-link|focus-visible|prefers-reduced-motion" design/assets/styles/base.css
```

Expected: all three patterns present.

- [ ] **Step 3: Commit**

```bash
git add design/assets/styles/base.css
git commit -m "feat(design): add base typography and a11y styles"
```

---

### Task 3: Layout styles (shell, home, tool chrome)

**Files:**
- Create: `design/assets/styles/layout.css`

**Interfaces:**
- Consumes: tokens from Task 1
- Produces: classes `.page`, `.shell`, `.site-header`, `.brand`, `.home`, `.tool-layout`, `.tool-sidebar`, `.tool-nav`, `.tool-nav__link`, `.tool-nav__link.is-active`, `.tool-main`, `.menu-toggle`, `.sidebar-backdrop`, body class `.nav-open`

- [ ] **Step 1: Create `design/assets/styles/layout.css`**

```css
.page {
  min-height: 100vh;
  padding: var(--space-5);
}

.shell {
  max-width: var(--content-max);
  margin: 0 auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-shell);
  box-shadow: var(--shadow-shell);
  overflow: hidden;
  position: relative;
}

.shell--blob::before,
.shell--blob::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.shell--blob::before {
  width: 220px;
  height: 220px;
  top: -80px;
  right: -60px;
  background: radial-gradient(circle, var(--color-accent-soft), transparent 70%);
}

.shell--blob::after {
  width: 200px;
  height: 200px;
  bottom: -90px;
  left: -50px;
  background: radial-gradient(circle, rgba(12, 10, 93, 0.12), transparent 70%);
}

.site-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: var(--header-height);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.brand {
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--color-primary);
  text-decoration: none;
}

.brand__accent {
  color: var(--color-accent);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-search {
  display: none;
  min-width: 180px;
  padding: var(--space-2) var(--space-4);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-canvas);
  color: var(--color-text);
  font: inherit;
}

.header-search::placeholder {
  color: var(--color-text-muted);
}

@media (min-width: 720px) {
  .header-search {
    display: inline-block;
  }
}

.menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface);
  color: var(--color-primary);
  cursor: pointer;
}

@media (min-width: 880px) {
  .menu-toggle {
    display: none;
  }
}

.home {
  position: relative;
  z-index: 1;
  padding: var(--space-7) var(--space-5) var(--space-6);
}

.home__kicker {
  margin: 0 0 var(--space-2);
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.home__lead {
  max-width: 36rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

.tool-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .tool-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.tool-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  min-height: 480px;
}

@media (min-width: 880px) {
  .tool-layout {
    grid-template-columns: var(--sidebar-width) 1fr;
  }
}

.tool-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: min(var(--sidebar-width), 86vw);
  z-index: 40;
  padding: var(--space-5) var(--space-3);
  background: #fbfbfc;
  border-right: 1px solid var(--color-border);
  transform: translateX(-105%);
  transition: transform var(--motion-base);
}

body.nav-open .tool-sidebar {
  transform: translateX(0);
}

@media (min-width: 880px) {
  .tool-sidebar {
    position: relative;
    inset: auto;
    width: auto;
    transform: none;
    transition: none;
  }
}

.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(12, 10, 93, 0.35);
}

body.nav-open .sidebar-backdrop {
  display: block;
}

@media (min-width: 880px) {
  body.nav-open .sidebar-backdrop {
    display: none;
  }
}

.tool-sidebar__label {
  margin: 0 var(--space-2) var(--space-3);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.tool-nav {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tool-nav__link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-1);
  border-radius: var(--radius-pill);
  color: var(--color-text);
  text-decoration: none;
  transition: background var(--motion-fast), color var(--motion-fast);
}

.tool-nav__link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.tool-nav__link.is-active {
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
}

.tool-nav__icon {
  width: 1rem;
  height: 1rem;
  border-radius: 6px;
  background: var(--color-primary-soft);
  flex: 0 0 auto;
}

.tool-nav__link.is-active .tool-nav__icon {
  background: rgba(255, 255, 255, 0.25);
}

.tool-main {
  padding: var(--space-5);
  background: var(--color-surface);
}

.tool-main__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.tool-main__hint {
  margin: 0;
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Verify layout class hooks**

Run:

```bash
rg -n "shell|tool-nav__link.is-active|nav-open|tool-grid" design/assets/styles/layout.css
```

Expected: all present.

- [ ] **Step 3: Commit**

```bash
git add design/assets/styles/layout.css
git commit -m "feat(design): add shell, home, and tool layout styles"
```

---

### Task 4: Component styles

**Files:**
- Create: `design/assets/styles/components.css`

**Interfaces:**
- Consumes: tokens from Task 1
- Produces: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.field`, `.field__label`, `.field__control`, `.field__hint`, `.field__error`, `.tool-card`, `.panel`, `.alert`, `.alert--error`, `.alert--success`, `.stack`, `.split-panes`, UI kit helpers `.state-grid`

- [ ] **Step 1: Create `design/assets/styles/components.css`**

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  transition: background var(--motion-fast), color var(--motion-fast), border-color var(--motion-fast);
}

.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(0.97);
  color: var(--color-on-accent);
}

.btn--secondary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.btn--ghost {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-primary);
}

.tool-card {
  display: block;
  padding: var(--space-5);
  border-radius: var(--radius-panel);
  background: var(--color-canvas);
  color: inherit;
  text-decoration: none;
  transition: background var(--motion-fast), box-shadow var(--motion-fast);
}

.tool-card:hover {
  background: var(--color-primary-soft);
  box-shadow: inset 0 0 0 1px rgba(12, 10, 93, 0.08);
}

.tool-card__icon {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  margin-bottom: var(--space-3);
  border-radius: 10px;
  background: rgba(12, 10, 93, 0.06);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.75rem;
}

.tool-card__title {
  display: block;
  margin-bottom: var(--space-1);
  font-family: var(--font-sans);
  font-weight: 600;
  color: var(--color-primary);
}

.tool-card__desc {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.field__label {
  font-weight: 600;
  color: var(--color-primary);
}

.field__control {
  width: 100%;
  min-height: 42px;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface-muted);
  color: var(--color-text);
  font: inherit;
}

textarea.field__control {
  min-height: 160px;
  resize: vertical;
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.field__control[aria-invalid="true"] {
  border-color: #b42318;
  background: #fff5f5;
}

.field__hint,
.field__error {
  margin: 0;
  font-size: 0.875rem;
}

.field__hint {
  color: var(--color-text-muted);
}

.field__error {
  color: #b42318;
}

.panel {
  padding: var(--space-4);
  border-radius: var(--radius-panel);
  background: var(--color-canvas);
  min-height: 140px;
}

.panel__title {
  margin: 0 0 var(--space-3);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.split-panes {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 720px) {
  .split-panes {
    grid-template-columns: 1fr 1fr;
  }
}

.alert {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-control);
  border: 1px solid var(--color-border);
  background: var(--color-primary-soft);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.alert--error {
  border-color: #fecdca;
  background: #fff5f5;
  color: #b42318;
}

.alert--success {
  border-color: #abeec5;
  background: #f0fdf4;
  color: #067647;
}

.stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.state-grid {
  display: grid;
  gap: var(--space-5);
}

.state-grid__section {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: var(--color-surface);
}

.state-grid__section h2 {
  margin-top: 0;
}
```

- [ ] **Step 2: Verify no brand hex outside intentional semantic error/success**

Run:

```bash
rg -n "#[0-9a-fA-F]{3,8}" design/assets/styles/components.css
```

Expected: only `#b42318`, `#fff5f5`, `#fecdca`, `#abeec5`, `#f0fdf4`, `#067647` (status colors). Brand navy/coral must not appear as raw hex here.

- [ ] **Step 3: Commit**

```bash
git add design/assets/styles/components.css
git commit -m "feat(design): add UI component styles"
```

---

### Task 5: Mobile navigation script

**Files:**
- Create: `design/assets/scripts/nav.js`

**Interfaces:**
- Consumes: DOM ids/attributes `data-nav-toggle`, `data-nav-sidebar`, `data-nav-backdrop`, `aria-controls`, `aria-expanded`
- Produces: toggles `body.nav-open`; focus trap while open; Esc / backdrop click closes; restores focus to toggle

- [ ] **Step 1: Create `design/assets/scripts/nav.js`**

```js
(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const sidebar = document.querySelector("[data-nav-sidebar]");
  const backdrop = document.querySelector("[data-nav-backdrop]");
  if (!toggle || !sidebar) return;

  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function getFocusable() {
    return Array.from(sidebar.querySelectorAll(focusableSelector)).filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
    );
  }

  function openNav() {
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    const focusable = getFocusable();
    (focusable[0] || sidebar).focus();
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  function isOpen() {
    return document.body.classList.contains("nav-open");
  }

  toggle.addEventListener("click", function () {
    if (isOpen()) closeNav();
    else openNav();
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeNav);
  }

  document.addEventListener("keydown", function (event) {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeNav();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
```

- [ ] **Step 2: Syntax-check the script**

Run:

```bash
node --check design/assets/scripts/nav.js
```

Expected: exit code 0, no output.

- [ ] **Step 3: Commit**

```bash
git add design/assets/scripts/nav.js
git commit -m "feat(design): add mobile drawer navigation script"
```

---

### Task 6: Shared HTML head + home page

**Files:**
- Create: `design/index.html`

**Interfaces:**
- Consumes: all four CSS files; Google Fonts Inter + DM Serif Display
- Produces: navigable home with links to all tools and `ui-kit.html`

- [ ] **Step 1: Create `design/index.html`**

Use this exact document (paths relative to `design/`):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DevToolkit — Free client-side developer tools</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="assets/styles/tokens.css" />
    <link rel="stylesheet" href="assets/styles/base.css" />
    <link rel="stylesheet" href="assets/styles/layout.css" />
    <link rel="stylesheet" href="assets/styles/components.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
    <div class="page">
      <div class="shell shell--blob">
        <header class="site-header">
          <a class="brand" href="index.html">Dev<span class="brand__accent">Toolkit</span></a>
          <div class="header-actions">
            <label class="visually-hidden" for="tool-search">Search tools</label>
            <input
              id="tool-search"
              class="header-search"
              type="search"
              placeholder="Search tools"
              disabled
              aria-disabled="true"
              title="Search coming in a later build"
            />
            <a class="btn btn--ghost" href="ui-kit.html">UI kit</a>
          </div>
        </header>
        <main id="main" class="home">
          <p class="home__kicker">Client-side · Private</p>
          <h1>Tools that stay in your browser</h1>
          <p class="home__lead">
            Compress, compare, encode — free utilities that never upload your data.
          </p>
          <div class="tool-grid">
            <a class="tool-card" href="image-compressor.html">
              <span class="tool-card__icon" aria-hidden="true">▣</span>
              <span class="tool-card__title">Image compressor</span>
              <span class="tool-card__desc">Shrink PNG &amp; JPG locally</span>
            </a>
            <a class="tool-card" href="qr-code-generator.html">
              <span class="tool-card__icon" aria-hidden="true">▥</span>
              <span class="tool-card__title">QR Code generator</span>
              <span class="tool-card__desc">Create downloadable QR codes</span>
            </a>
            <a class="tool-card" href="json-comparer.html">
              <span class="tool-card__icon" aria-hidden="true">{ }</span>
              <span class="tool-card__title">JSON comparer</span>
              <span class="tool-card__desc">Diff two JSON payloads</span>
            </a>
            <a class="tool-card" href="text-comparer.html">
              <span class="tool-card__icon" aria-hidden="true">Aa</span>
              <span class="tool-card__title">Text comparer</span>
              <span class="tool-card__desc">Side-by-side text diff</span>
            </a>
            <a class="tool-card" href="base64.html">
              <span class="tool-card__icon" aria-hidden="true">64</span>
              <span class="tool-card__title">Base64</span>
              <span class="tool-card__desc">Encode and decode strings</span>
            </a>
          </div>
        </main>
      </div>
    </div>
  </body>
</html>
```

Also add this utility to `design/assets/styles/base.css` (append):

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

- [ ] **Step 2: Verify home links**

Run:

```bash
rg -o 'href="[^"]+\.html"' design/index.html
```

Expected: `ui-kit.html`, `image-compressor.html`, `qr-code-generator.html`, `json-comparer.html`, `text-comparer.html`, `base64.html`.

- [ ] **Step 3: Commit**

```bash
git add design/index.html design/assets/styles/base.css
git commit -m "feat(design): add DevToolkit home page"
```

---

### Task 7: Canonical tool page (JSON comparer) + chrome pattern

**Files:**
- Create: `design/json-comparer.html`

**Interfaces:**
- Consumes: CSS stack + `nav.js`; class hooks from Tasks 3–5
- Produces: the reference markup every other tool page must copy for chrome (header, sidebar list, active class, drawer attributes)

**Sidebar link order (use on every tool page):**
1. `image-compressor.html` — Image compressor
2. `qr-code-generator.html` — QR Code
3. `json-comparer.html` — JSON comparer
4. `text-comparer.html` — Text comparer
5. `base64.html` — Base64

Only the current page gets `class="tool-nav__link is-active"` and `aria-current="page"`.

- [ ] **Step 1: Create `design/json-comparer.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>JSON comparer — DevToolkit</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="assets/styles/tokens.css" />
    <link rel="stylesheet" href="assets/styles/base.css" />
    <link rel="stylesheet" href="assets/styles/layout.css" />
    <link rel="stylesheet" href="assets/styles/components.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
    <div class="page">
      <div class="shell">
        <header class="site-header">
          <a class="brand" href="index.html">Dev<span class="brand__accent">Toolkit</span></a>
          <div class="header-actions">
            <a class="btn btn--ghost" href="index.html">All tools</a>
            <button
              class="menu-toggle"
              type="button"
              data-nav-toggle
              aria-controls="tool-sidebar"
              aria-expanded="false"
            >
              Menu
            </button>
          </div>
        </header>
        <div class="tool-layout">
          <div class="sidebar-backdrop" data-nav-backdrop></div>
          <aside
            id="tool-sidebar"
            class="tool-sidebar"
            data-nav-sidebar
            tabindex="-1"
            aria-label="Tools"
          >
            <p class="tool-sidebar__label">Tools</p>
            <nav>
              <ul class="tool-nav">
                <li>
                  <a class="tool-nav__link" href="image-compressor.html"
                    ><span class="tool-nav__icon" aria-hidden="true"></span>Image compressor</a
                  >
                </li>
                <li>
                  <a class="tool-nav__link" href="qr-code-generator.html"
                    ><span class="tool-nav__icon" aria-hidden="true"></span>QR Code</a
                  >
                </li>
                <li>
                  <a
                    class="tool-nav__link is-active"
                    href="json-comparer.html"
                    aria-current="page"
                    ><span class="tool-nav__icon" aria-hidden="true"></span>JSON comparer</a
                  >
                </li>
                <li>
                  <a class="tool-nav__link" href="text-comparer.html"
                    ><span class="tool-nav__icon" aria-hidden="true"></span>Text comparer</a
                  >
                </li>
                <li>
                  <a class="tool-nav__link" href="base64.html"
                    ><span class="tool-nav__icon" aria-hidden="true"></span>Base64</a
                  >
                </li>
              </ul>
            </nav>
          </aside>
          <main id="main" class="tool-main">
            <div class="tool-main__header">
              <div>
                <h1>JSON comparer</h1>
                <p class="tool-main__hint">Paste left &amp; right — diffs stay on-device.</p>
              </div>
              <button class="btn btn--primary" type="button">Compare</button>
            </div>
            <div class="split-panes">
              <div class="field">
                <label class="field__label" for="json-left">Left JSON</label>
                <textarea class="field__control" id="json-left" rows="12">{
  "hello": "world"
}</textarea>
              </div>
              <div class="field">
                <label class="field__label" for="json-right">Right JSON</label>
                <textarea class="field__control" id="json-right" rows="12">{
  "hello": "devtoolkit"
}</textarea>
              </div>
            </div>
            <div class="panel" aria-live="polite">
              <p class="panel__title">Result</p>
              <p class="tool-main__hint">Comparison output will appear here (prototype placeholder).</p>
            </div>
          </main>
        </div>
      </div>
    </div>
    <script src="assets/scripts/nav.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify active state and script include**

Run:

```bash
rg -n "is-active|aria-current|nav.js|data-nav-toggle" design/json-comparer.html
```

Expected: all present; only JSON link has `is-active`.

- [ ] **Step 3: Commit**

```bash
git add design/json-comparer.html
git commit -m "feat(design): add JSON comparer tool shell"
```

---

### Task 8: Remaining tool shells

**Files:**
- Create: `design/image-compressor.html`
- Create: `design/qr-code-generator.html`
- Create: `design/text-comparer.html`
- Create: `design/base64.html`

**Interfaces:**
- Consumes: identical chrome pattern from Task 7
- Produces: four navigable tool pages with correct `is-active` item and tool-specific main content

- [ ] **Step 1: Create each page by copying `json-comparer.html` chrome**, then set title, `aria-current` / `is-active` on the matching sidebar link, and replace `<main>` as follows.

**`image-compressor.html` main:**

```html
<main id="main" class="tool-main">
  <div class="tool-main__header">
    <div>
      <h1>Image compressor</h1>
      <p class="tool-main__hint">Compress PNG &amp; JPG locally — files never leave your device.</p>
    </div>
    <button class="btn btn--primary" type="button">Compress</button>
  </div>
  <div class="field">
    <label class="field__label" for="image-file">Image file</label>
    <input class="field__control" id="image-file" type="file" accept="image/png,image/jpeg" />
    <p class="field__hint">PNG or JPG up to a few MB (prototype — no processing yet).</p>
  </div>
  <div class="split-panes">
    <div class="panel">
      <p class="panel__title">Original</p>
      <p class="tool-main__hint">Preview placeholder</p>
    </div>
    <div class="panel">
      <p class="panel__title">Compressed</p>
      <p class="tool-main__hint">Result placeholder</p>
    </div>
  </div>
</main>
```

**`qr-code-generator.html` main:**

```html
<main id="main" class="tool-main">
  <div class="tool-main__header">
    <div>
      <h1>QR Code generator</h1>
      <p class="tool-main__hint">Generate a QR code in your browser.</p>
    </div>
    <button class="btn btn--primary" type="button">Generate</button>
  </div>
  <div class="field">
    <label class="field__label" for="qr-text">Content</label>
    <textarea class="field__control" id="qr-text" rows="4">https://sivadass.in</textarea>
  </div>
  <div class="panel">
    <p class="panel__title">Preview</p>
    <p class="tool-main__hint">QR preview placeholder</p>
  </div>
</main>
```

**`text-comparer.html` main:**

```html
<main id="main" class="tool-main">
  <div class="tool-main__header">
    <div>
      <h1>Text comparer</h1>
      <p class="tool-main__hint">Compare two text blocks — stays on-device.</p>
    </div>
    <button class="btn btn--primary" type="button">Compare</button>
  </div>
  <div class="split-panes">
    <div class="field">
      <label class="field__label" for="text-left">Left</label>
      <textarea class="field__control" id="text-left" rows="12">Hello world</textarea>
    </div>
    <div class="field">
      <label class="field__label" for="text-right">Right</label>
      <textarea class="field__control" id="text-right" rows="12">Hello DevToolkit</textarea>
    </div>
  </div>
  <div class="panel" aria-live="polite">
    <p class="panel__title">Diff</p>
    <p class="tool-main__hint">Diff output placeholder</p>
  </div>
</main>
```

**`base64.html` main:**

```html
<main id="main" class="tool-main">
  <div class="tool-main__header">
    <div>
      <h1>Base64</h1>
      <p class="tool-main__hint">Encode or decode Base64 in your browser.</p>
    </div>
    <div class="stack">
      <button class="btn btn--secondary" type="button">Encode</button>
      <button class="btn btn--primary" type="button">Decode</button>
    </div>
  </div>
  <div class="field">
    <label class="field__label" for="base64-input">Input</label>
    <textarea class="field__control" id="base64-input" rows="8">DevToolkit</textarea>
  </div>
  <div class="field">
    <label class="field__label" for="base64-output">Output</label>
    <textarea class="field__control" id="base64-output" rows="8" readonly placeholder="Result appears here"></textarea>
  </div>
</main>
```

- [ ] **Step 2: Verify every tool page has chrome + script**

Run:

```bash
for f in design/image-compressor.html design/qr-code-generator.html design/text-comparer.html design/base64.html; do
  echo "== $f =="
  rg -n "is-active|nav.js|Skip to main content" "$f"
done
```

Expected: each file shows `is-active`, `nav.js`, and skip link.

- [ ] **Step 3: Commit**

```bash
git add design/image-compressor.html design/qr-code-generator.html design/text-comparer.html design/base64.html
git commit -m "feat(design): add remaining tool page shells"
```

---

### Task 9: UI kit page

**Files:**
- Create: `design/ui-kit.html`

**Interfaces:**
- Consumes: CSS component classes from Task 4
- Produces: documented default / hover note / focus / disabled / error / empty states

- [ ] **Step 1: Create `design/ui-kit.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>UI kit — DevToolkit</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="assets/styles/tokens.css" />
    <link rel="stylesheet" href="assets/styles/base.css" />
    <link rel="stylesheet" href="assets/styles/layout.css" />
    <link rel="stylesheet" href="assets/styles/components.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to main content</a>
    <div class="page">
      <div class="shell">
        <header class="site-header">
          <a class="brand" href="index.html">Dev<span class="brand__accent">Toolkit</span></a>
          <div class="header-actions">
            <a class="btn btn--ghost" href="index.html">All tools</a>
          </div>
        </header>
        <main id="main" class="tool-main state-grid">
          <h1>UI kit</h1>
          <p class="tool-main__hint">Shared controls and states for the DevToolkit prototype.</p>

          <section class="state-grid__section" aria-labelledby="buttons-heading">
            <h2 id="buttons-heading">Buttons</h2>
            <div class="stack">
              <button class="btn btn--primary" type="button">Primary</button>
              <button class="btn btn--secondary" type="button">Secondary</button>
              <button class="btn btn--ghost" type="button">Ghost</button>
              <button class="btn btn--primary" type="button" disabled>Disabled</button>
            </div>
            <p class="field__hint">Tab here to verify `:focus-visible` rings.</p>
          </section>

          <section class="state-grid__section" aria-labelledby="fields-heading">
            <h2 id="fields-heading">Fields</h2>
            <div class="field">
              <label class="field__label" for="demo-default">Default</label>
              <input class="field__control" id="demo-default" type="text" value="Sample value" />
              <p class="field__hint">Supporting hint text</p>
            </div>
            <div class="field">
              <label class="field__label" for="demo-error">Error</label>
              <input
                class="field__control"
                id="demo-error"
                type="text"
                value="{ broken"
                aria-invalid="true"
                aria-describedby="demo-error-msg"
              />
              <p class="field__error" id="demo-error-msg">JSON must be valid before comparing.</p>
            </div>
            <div class="field">
              <label class="field__label" for="demo-empty">Empty</label>
              <textarea class="field__control" id="demo-empty" rows="4" placeholder="Paste content…"></textarea>
            </div>
          </section>

          <section class="state-grid__section" aria-labelledby="alerts-heading">
            <h2 id="alerts-heading">Alerts</h2>
            <div class="alert" role="status">Neutral informational message.</div>
            <div class="alert alert--success" role="status">Action completed successfully.</div>
            <div class="alert alert--error" role="alert">Something needs your attention.</div>
          </section>

          <section class="state-grid__section" aria-labelledby="nav-heading">
            <h2 id="nav-heading">Sidebar active state</h2>
            <ul class="tool-nav" style="max-width: 240px">
              <li><a class="tool-nav__link" href="#"><span class="tool-nav__icon" aria-hidden="true"></span>Default</a></li>
              <li>
                <a class="tool-nav__link is-active" href="#" aria-current="page"
                  ><span class="tool-nav__icon" aria-hidden="true"></span>Active pill</a
                >
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  </body>
</html>
```

- [ ] **Step 2: Verify UI kit states**

Run:

```bash
rg -n "disabled|aria-invalid|alert--error|is-active|focus-visible" design/ui-kit.html design/assets/styles/base.css
```

Expected: disabled button, invalid field, error alert, active nav, focus-visible rule.

- [ ] **Step 3: Commit**

```bash
git add design/ui-kit.html
git commit -m "feat(design): add UI kit reference page"
```

---

### Task 10: README + end-to-end verification

**Files:**
- Create: `design/README.md`

**Interfaces:**
- Consumes: completed prototype tree
- Produces: viewing instructions; checklist against spec success criteria

- [ ] **Step 1: Create `design/README.md`**

```markdown
# DevToolkit design prototype

Static HTML prototype for layout, brand tokens, and accessibility.

## View locally

From the repo root:

```bash
python3 -m http.server 4173 --directory design
```

Open [http://localhost:4173/](http://localhost:4173/).

Or open `design/index.html` directly in a browser (Google Fonts still need network).

## Pages

- `index.html` — home
- `image-compressor.html`, `qr-code-generator.html`, `json-comparer.html`, `text-comparer.html`, `base64.html` — tool shells
- `ui-kit.html` — shared components and states

## Tokens

Brand colors and spacing live in `assets/styles/tokens.css`. Do not hard-code brand hex values in components.
```

- [ ] **Step 2: File tree check**

Run:

```bash
find design -type f | sort
```

Expected (at minimum):

```
design/README.md
design/assets/scripts/nav.js
design/assets/styles/base.css
design/assets/styles/components.css
design/assets/styles/layout.css
design/assets/styles/tokens.css
design/base64.html
design/image-compressor.html
design/index.html
design/json-comparer.html
design/qr-code-generator.html
design/text-comparer.html
design/ui-kit.html
```

- [ ] **Step 3: Brand hex isolation check**

Run:

```bash
rg -n "#0c0a5d|#f39660|#f4f5f7" design --glob '!assets/styles/tokens.css'
```

Expected: **no matches** (brand hex only in `tokens.css`). If matches appear in HTML inline styles, move them to tokens/classes.

- [ ] **Step 4: Manual browser checklist**

Start server:

```bash
python3 -m http.server 4173 --directory design
```

Verify:

1. Home shows brand, pitch, five tool cards; no sidebar
2. Each tool page shows pill sidebar with correct active item
3. Logo / All tools return home
4. Narrow viewport: Menu opens drawer; Esc closes; focus moves into drawer
5. Tab through UI kit — visible focus rings
6. Skip link appears on focus

- [ ] **Step 5: Commit**

```bash
git add design/README.md
git commit -m "docs(design): add prototype viewing README"
```

---

## Spec coverage checklist (plan self-review)

| Spec requirement | Task |
|------------------|------|
| Hybrid IA (home grid / tool sidebar) | 3, 6, 7, 8 |
| Soft shell + canvas + pill active nav | 3, 7 |
| sivadass.in palette as CSS tokens | 1 |
| Light-only, themeable later | 1 (`:root` only) |
| All tool shells + UI kit | 6–9 |
| Skip link, focus, reduced motion, labels, drawer a11y | 2, 5, 7, 9 |
| kebab-case `/design` structure | all tasks |
| No real tool logic | 6–8 placeholders |
| Success criteria verification | 10 |
