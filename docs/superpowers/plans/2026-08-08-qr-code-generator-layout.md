# QR Code Generator Layout Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `design/qr-code-generator.html` into a preview-first, two-column static prototype matching the approved layout spec (live-app feature set only).

**Architecture:** Keep the existing DevToolkit tool shell (header + sidebar + `tool-main`). Replace the thin content/placeholder body with a `.qr-layout` CSS grid: preview panel left, customization panel right. Add QR-specific component classes to shared CSS; no new JS beyond existing `nav.js`. Default markup shows the filled preview state so the composition reads clearly.

**Tech Stack:** Static HTML5, existing design CSS layers (`tokens` → `base` → `layout` → `components`), Material Symbols, vanilla `nav.js`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-08-qr-code-generator-layout-design.md`
- Layout: Preview left · controls right; mobile stacks controls then preview
- Features only: content, size, ECC, foreground/background, Generate, Download PNG/SVG
- No logo, styles, templates, JPEG/WEBP, or React (`app/`) changes
- Brand colors only via tokens — do not hard-code brand hex in new rules (exception: existing alert error reds already in `components.css`)
- Filenames: kebab-case
- Product name: **DevToolkit**

---

## File map

| File | Responsibility |
|------|----------------|
| `design/assets/styles/components.css` | QR layout grid, preview stage, option rows, download row, color field, panel header with CTA |
| `design/qr-code-generator.html` | Full tool page markup (filled demo state) |
| `design/README.md` | No change required unless QR notes are missing |

---

### Task 1: QR layout CSS

**Files:**
- Modify: `design/assets/styles/components.css` (append after existing `.panel` / utility rules)

**Interfaces:**
- Consumes: existing tokens (`--space-*`, `--color-*`, `--radius-*`, `--motion-*`)
- Produces: classes `.qr-layout`, `.qr-panel`, `.qr-panel__header`, `.qr-preview-stage`, `.qr-preview-stage__img`, `.qr-preview-meta`, `.qr-download-row`, `.qr-options-row`, `.qr-color-field`, `.qr-color-field__swatch`

- [ ] **Step 1: Append QR component styles to `components.css`**

Append exactly these rules (after the last existing rule in the file):

```css
/* —— QR Code generator —— */

.qr-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  align-items: start;
}

@media (min-width: 900px) {
  .qr-layout {
    grid-template-columns: 1fr 1fr;
  }

  .qr-layout__preview {
    order: 0;
  }

  .qr-layout__controls {
    order: 0;
  }
}

/* Mobile: controls first, preview second */
.qr-layout__controls {
  order: -1;
}

@media (min-width: 900px) {
  .qr-layout__controls {
    order: 0;
  }
}

.qr-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-panel);
  background: var(--color-canvas);
  min-height: 0;
}

.qr-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.qr-panel__header .panel__title {
  margin: 0;
}

.qr-preview-stage {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding: var(--space-5);
  border-radius: var(--radius-panel);
  background:
    linear-gradient(45deg, var(--color-surface-muted) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-surface-muted) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-surface-muted) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-surface-muted) 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.qr-preview-stage--empty {
  background: var(--color-surface-muted);
  background-image: none;
}

.qr-preview-stage__img {
  width: min(100%, 256px);
  height: auto;
  display: block;
  image-rendering: pixelated;
}

.qr-preview-stage__placeholder {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  text-align: center;
}

.qr-preview-meta {
  margin: 0;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.qr-download-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.qr-download-row .btn {
  width: 100%;
}

.qr-options-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 480px) {
  .qr-options-row {
    grid-template-columns: 1fr 1fr;
  }
}

.qr-options-row .field {
  margin-bottom: 0;
}

.qr-color-field {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.qr-color-field__swatch {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-control);
  border: 1px solid var(--color-border);
  padding: 0;
  cursor: default;
  background: var(--color-surface);
}

.qr-color-field .field__control {
  flex: 1;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 0.875rem;
}
```

- [ ] **Step 2: Visual sanity check (CSS only)**

Confirm the file has no syntax errors (balanced braces). Optional: open any existing tool page and verify styles still load.

- [ ] **Step 3: Commit** (only if the user asked to commit)

```bash
git add design/assets/styles/components.css
git commit -m "$(cat <<'EOF'
Add QR generator layout component styles for the design prototype.
EOF
)"
```

---

### Task 2: QR page markup (filled demo state)

**Files:**
- Modify: `design/qr-code-generator.html`

**Interfaces:**
- Consumes: classes from Task 1; existing shell, `.btn`, `.field`, `.panel__title`, `nav.js`
- Produces: complete static page showing filled preview + all live-app controls

- [ ] **Step 1: Replace `tool-main` body content**

Keep the existing page chrome (header, sidebar, `tool-main__header` with title/hint — remove the header Generate button; Generate moves into the customization card). Replace everything inside `<main id="main" class="tool-main">` after the header with:

```html
<main id="main" class="tool-main">
  <div class="tool-main__header">
    <div>
      <h1>QR Code generator</h1>
      <p class="tool-main__hint">Generate a QR code in your browser.</p>
    </div>
  </div>

  <div class="qr-layout">
    <section class="qr-panel qr-layout__preview" aria-labelledby="qr-preview-title">
      <p class="panel__title" id="qr-preview-title">Preview</p>
      <div class="qr-preview-stage" aria-label="QR code preview">
        <!-- Inline SVG QR placeholder (decorative, not scannable) -->
        <svg
          class="qr-preview-stage__img"
          viewBox="0 0 29 29"
          width="256"
          height="256"
          role="img"
          aria-label="Sample QR code"
        >
          <rect width="29" height="29" fill="#ffffff" />
          <g fill="#222222">
            <rect x="0" y="0" width="7" height="7" />
            <rect x="1" y="1" width="5" height="5" fill="#ffffff" />
            <rect x="2" y="2" width="3" height="3" />
            <rect x="22" y="0" width="7" height="7" />
            <rect x="23" y="1" width="5" height="5" fill="#ffffff" />
            <rect x="24" y="2" width="3" height="3" />
            <rect x="0" y="22" width="7" height="7" />
            <rect x="1" y="23" width="5" height="5" fill="#ffffff" />
            <rect x="2" y="24" width="3" height="3" />
            <rect x="8" y="2" width="1" height="1" />
            <rect x="10" y="2" width="1" height="1" />
            <rect x="12" y="3" width="1" height="1" />
            <rect x="9" y="4" width="1" height="1" />
            <rect x="11" y="5" width="1" height="1" />
            <rect x="14" y="2" width="1" height="1" />
            <rect x="16" y="4" width="1" height="1" />
            <rect x="18" y="3" width="1" height="1" />
            <rect x="8" y="8" width="1" height="1" />
            <rect x="10" y="8" width="1" height="1" />
            <rect x="12" y="9" width="1" height="1" />
            <rect x="14" y="8" width="1" height="1" />
            <rect x="16" y="10" width="1" height="1" />
            <rect x="18" y="8" width="1" height="1" />
            <rect x="20" y="9" width="1" height="1" />
            <rect x="9" y="11" width="1" height="1" />
            <rect x="11" y="12" width="1" height="1" />
            <rect x="13" y="11" width="1" height="1" />
            <rect x="15" y="13" width="1" height="1" />
            <rect x="17" y="12" width="1" height="1" />
            <rect x="19" y="14" width="1" height="1" />
            <rect x="8" y="14" width="1" height="1" />
            <rect x="10" y="15" width="1" height="1" />
            <rect x="12" y="16" width="1" height="1" />
            <rect x="14" y="15" width="1" height="1" />
            <rect x="16" y="17" width="1" height="1" />
            <rect x="18" y="16" width="1" height="1" />
            <rect x="20" y="18" width="1" height="1" />
            <rect x="22" y="10" width="1" height="1" />
            <rect x="24" y="12" width="1" height="1" />
            <rect x="26" y="11" width="1" height="1" />
            <rect x="22" y="14" width="1" height="1" />
            <rect x="25" y="15" width="1" height="1" />
            <rect x="23" y="17" width="1" height="1" />
            <rect x="8" y="20" width="1" height="1" />
            <rect x="10" y="22" width="1" height="1" />
            <rect x="12" y="21" width="1" height="1" />
            <rect x="14" y="23" width="1" height="1" />
            <rect x="16" y="22" width="1" height="1" />
            <rect x="18" y="24" width="1" height="1" />
            <rect x="20" y="23" width="1" height="1" />
            <rect x="22" y="20" width="1" height="1" />
            <rect x="24" y="22" width="1" height="1" />
            <rect x="26" y="24" width="1" height="1" />
            <rect x="20" y="26" width="1" height="1" />
            <rect x="16" y="26" width="1" height="1" />
            <rect x="12" y="26" width="1" height="1" />
          </g>
        </svg>
      </div>
      <p class="qr-preview-meta">256×256px</p>
      <div class="qr-download-row">
        <button class="btn btn--ghost" type="button">Download PNG</button>
        <button class="btn btn--ghost" type="button">Download SVG</button>
      </div>
    </section>

    <section class="qr-panel qr-layout__controls" aria-labelledby="qr-controls-title">
      <div class="qr-panel__header">
        <p class="panel__title" id="qr-controls-title">Customization</p>
        <button class="btn btn--primary" type="button">Generate</button>
      </div>

      <div class="field">
        <label class="field__label" for="qr-text">Content</label>
        <textarea class="field__control" id="qr-text" rows="4">https://sivadass.in</textarea>
        <p class="field__hint">Up to 4296 characters. URLs, text, or any string.</p>
      </div>

      <div class="qr-options-row">
        <div class="field">
          <label class="field__label" for="qr-size">Size (px)</label>
          <input class="field__control" id="qr-size" type="number" value="256" min="128" max="1024" step="32" />
        </div>
        <div class="field">
          <label class="field__label" for="qr-ecc">Error correction</label>
          <select class="field__control" id="qr-ecc">
            <option value="L">L (~7%)</option>
            <option value="M" selected>M (~15%)</option>
            <option value="Q">Q (~25%)</option>
            <option value="H">H (~30%)</option>
          </select>
        </div>
      </div>

      <div class="qr-options-row">
        <div class="field">
          <label class="field__label" for="qr-fg">Foreground</label>
          <div class="qr-color-field">
            <span class="qr-color-field__swatch" style="background:#222222" aria-hidden="true"></span>
            <input class="field__control" id="qr-fg" type="text" value="#222222" spellcheck="false" />
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="qr-bg">Background</label>
          <div class="qr-color-field">
            <span class="qr-color-field__swatch" style="background:#ffffff" aria-hidden="true"></span>
            <input class="field__control" id="qr-bg" type="text" value="#ffffff" spellcheck="false" />
          </div>
        </div>
      </div>
    </section>
  </div>
</main>
```

Keep the rest of the file (DOCTYPE, shell, sidebar, `nav.js`) unchanged. Sidebar “QR Code” link remains `is-active`.

Note: swatch `style="background:#…"` is intentional for the static demo of user-chosen colors (not brand tokens).

- [ ] **Step 2: Preview in browser**

```bash
python3 -m http.server 4173 --directory design
```

Open `http://localhost:4173/qr-code-generator.html`.

**Expected:**
- Desktop (~1100px): two columns; preview left, customization right; Generate in card header; PNG/SVG under preview
- Narrow (<900px): customization above preview
- No logo / style / template UI
- Shell matches other tool pages

- [ ] **Step 3: Iterate polish if needed**

If spacing feels tight or the stage too small/large, adjust only QR-specific CSS (max-width of stage, panel padding, gap) — do not invent new features.

- [ ] **Step 4: Commit** (only if the user asked to commit)

```bash
git add design/qr-code-generator.html design/assets/styles/components.css
git commit -m "$(cat <<'EOF'
Wireframe QR generator as a preview-first two-column layout.
EOF
)"
```

---

### Task 3: Empty-state reference (optional snippet in page comment or ui-kit)

**Files:**
- Modify: `design/qr-code-generator.html` (HTML comment only) — OR skip if filled state alone is enough

**Interfaces:**
- Consumes: `.qr-preview-stage--empty`, `.qr-preview-stage__placeholder`
- Produces: documented empty markup for implementers

- [ ] **Step 1: Add an HTML comment above the filled stage documenting empty markup**

```html
<!-- Empty preview state (swap in when no result):
<div class="qr-preview-stage qr-preview-stage--empty">
  <p class="qr-preview-stage__placeholder">Generate to preview</p>
</div>
<p class="qr-preview-meta" hidden>256×256px</p>
<div class="qr-download-row">
  <button class="btn btn--ghost" type="button" disabled>Download PNG</button>
  <button class="btn btn--ghost" type="button" disabled>Download SVG</button>
</div>
-->
```

- [ ] **Step 2: Re-check page in browser** — filled state still default; comment does not affect layout

- [ ] **Step 3: Commit** (only if the user asked to commit)

```bash
git add design/qr-code-generator.html
git commit -m "$(cat <<'EOF'
Document QR preview empty state in the design prototype.
EOF
)"
```

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| Preview left / controls right | Task 1 + 2 |
| Content, size, ECC, colors, Generate, PNG/SVG | Task 2 |
| Generate in customization header | Task 2 |
| Filled default demo state | Task 2 |
| Empty state documented | Task 3 |
| Mobile: controls then preview | Task 1 (`order`) |
| Tokens only / no React port | Global constraints |
| No out-of-scope features | Task 2 markup |

## Self-review notes

- No placeholders / TBD left in steps
- Class names consistent across Task 1 CSS and Task 2 HTML
- Commit steps gated on explicit user request (repo user rule)
