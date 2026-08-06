# ColorPicker Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade CleanPlate to `^0.3.35` and replace QR generator Foreground/Background native color inputs with `FormControls.ColorPicker` (`clearable={false}`).

**Architecture:** Direct swap in `qr-code-generator-page.tsx` only. Hook state stays `string` hex. Defensive `if (color)` on `onChange` so null never clears required colors. No new wrappers or CSS.

**Tech Stack:** React 19, TypeScript, Vite, CleanPlate `^0.3.35`, Vitest, Testing Library. Spec: `docs/superpowers/specs/2026-08-06-color-picker-upgrade-design.md`.

## Global Constraints

- Filenames: **kebab-case** only (repo Cursor rule)
- CleanPlate version floor: **`^0.3.35`**
- Color fields: **`clearable={false}`** — colors always remain set
- State shape: keep `string` hex in `useQrCodeGenerator` (`#000000` / `#ffffff`)
- Preserve `dataTestId`s: `qr-foreground`, `qr-background`
- Do not change `normalizeHexColor` / generate validation
- Do not modify other tools or add a shared color-field wrapper
- Before inventing CleanPlate props, read `node_modules/cleanplate/docs/FormControls.md` (ColorPicker section)

---

## File map

| File | Responsibility |
|------|----------------|
| `app/package.json` | Bump `cleanplate` dependency |
| `app/package-lock.json` | Lock resolved cleanplate ≥ 0.3.35 |
| `app/src/features/qr-code-generator/qr-code-generator-page.tsx` | Swap Input → ColorPicker |
| `app/src/features/qr-code-generator/qr-code-generator-page.test.tsx` | Assert ColorPicker-specific test ids |

---

### Task 1: Upgrade cleanplate to ^0.3.35

**Files:**
- Modify: `app/package.json`
- Modify: `app/package-lock.json`

**Interfaces:**
- Consumes: none
- Produces: `cleanplate@0.3.35` (or newer patch) installed; `FormControls.ColorPicker` available from `"cleanplate"`

- [ ] **Step 1: Bump dependency in package.json**

In `app/package.json`, change:

```json
"cleanplate": "^0.3.34"
```

to:

```json
"cleanplate": "^0.3.35"
```

- [ ] **Step 2: Install**

```bash
cd app && npm install
```

Expected: install succeeds; lockfile updates `cleanplate` to `0.3.35` (or compatible `^0.3.35` resolution).

- [ ] **Step 3: Confirm ColorPicker export exists**

```bash
cd app && node -e "const cp = require('cleanplate'); console.log(typeof cp.FormControls.ColorPicker)"
```

If ESM-only, use:

```bash
cd app && node --input-type=module -e "import { FormControls } from 'cleanplate'; console.log(typeof FormControls.ColorPicker)"
```

Expected: prints `function` or `object` (React component). Fail if `undefined`.

- [ ] **Step 4: Commit**

```bash
git add app/package.json app/package-lock.json
git commit -m "$(cat <<'EOF'
chore(app): upgrade cleanplate to ^0.3.35

EOF
)"
```

---

### Task 2: Replace QR color inputs with ColorPicker

**Files:**
- Modify: `app/src/features/qr-code-generator/qr-code-generator-page.test.tsx`
- Modify: `app/src/features/qr-code-generator/qr-code-generator-page.tsx`

**Interfaces:**
- Consumes: `FormControls.ColorPicker` from cleanplate `^0.3.35`; `foreground` / `background` / setters from `useQrCodeGenerator()` (`string`)
- Produces: ColorPicker fields with `clearable={false}`; `onChange: (color: string | null) => void` that only updates state when `color` is truthy

- [ ] **Step 1: Write the failing test**

Replace contents of `app/src/features/qr-code-generator/qr-code-generator-page.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QrCodeGeneratorPage } from "./qr-code-generator-page";

describe("QrCodeGeneratorPage", () => {
  it("renders title and disables Generate when content is empty", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByText("QR Code generator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
  });

  it("renders ColorPicker fields for foreground and background", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByTestId("qr-foreground")).toBeInTheDocument();
    expect(screen.getByTestId("qr-foreground-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("qr-background")).toBeInTheDocument();
    expect(screen.getByTestId("qr-background-trigger")).toBeInTheDocument();
  });
});
```

The `-trigger` suffixes are ColorPicker-specific (native `Input type="color"` does not emit them).

- [ ] **Step 2: Run test to verify it fails**

```bash
cd app && npm test -- src/features/qr-code-generator/qr-code-generator-page.test.tsx
```

Expected: FAIL — `Unable to find an element by: [data-testid="qr-foreground-trigger"]` (or background equivalent).

- [ ] **Step 3: Swap color fields to ColorPicker**

In `app/src/features/qr-code-generator/qr-code-generator-page.tsx`, replace the two `FormControls.Input` color blocks (Foreground and Background) with:

```tsx
          <FormControls.ColorPicker
            label="Foreground"
            value={foreground}
            onChange={(color) => {
              if (color) setForeground(color);
            }}
            clearable={false}
            isFluid
            margin="0"
            dataTestId="qr-foreground"
          />
          <FormControls.ColorPicker
            label="Background"
            value={background}
            onChange={(color) => {
              if (color) setBackground(color);
            }}
            clearable={false}
            isFluid
            margin="0"
            dataTestId="qr-background"
          />
```

Do not change imports (still `FormControls` from `"cleanplate"`), hook usage, or surrounding layout.

- [ ] **Step 4: Run tests and typecheck**

```bash
cd app && npm test -- src/features/qr-code-generator/qr-code-generator-page.test.tsx
cd app && npm run typecheck
```

Expected: both PASS.

- [ ] **Step 5: Run full test suite**

```bash
cd app && npm test
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/features/qr-code-generator/qr-code-generator-page.tsx app/src/features/qr-code-generator/qr-code-generator-page.test.tsx
git commit -m "$(cat <<'EOF'
feat(qr-code-generator): use FormControls.ColorPicker for colors

EOF
)"
```

---

## Self-review checklist

| Spec requirement | Task |
|------------------|------|
| Upgrade cleanplate to `^0.3.35` | Task 1 |
| Replace Foreground/Background with ColorPicker | Task 2 |
| `clearable={false}` | Task 2 Step 3 |
| Keep string hex state / no hook change | Task 2 (implicit) |
| Preserve `dataTestId`s | Task 2 Step 3 |
| Typecheck + existing tests pass | Task 2 Steps 4–5 |
| No other tools / no wrapper / no CSS | Out of scope — no tasks |

Manual smoke (open QR generator, pick colors, generate) remains a human check after implementation; not automated in this plan.
