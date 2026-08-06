# CleanPlate ColorPicker Upgrade — Design Spec

**Date:** 2026-08-06  
**Status:** Approved for implementation planning  
**Scope:** Upgrade `cleanplate` and replace QR generator color fields with `FormControls.ColorPicker`.

## Goal

Adopt CleanPlate’s new `FormControls.ColorPicker` so color selection in toolkit tools uses the shared form-control pattern (swatch + hex, desktop popover / mobile sheet) instead of native `input type="color"`.

## Product decisions

| Decision | Choice |
|----------|--------|
| Package version | Upgrade `cleanplate` to `^0.3.35` (includes ColorPicker) |
| Call sites | QR Code generator only — Foreground + Background |
| Clearable | `clearable={false}` — colors always remain set (same as native color input) |
| State shape | Keep `string` hex in `useQrCodeGenerator` (`#000000` / `#ffffff` defaults) |
| Approach | Direct swap in the page; no wrapper helper or hook API change |

## Out of scope

- Other tools (none currently have color fields)
- CSS layout changes beyond what ColorPicker brings
- New shared color-field wrapper component
- Changing validation / `normalizeHexColor` behavior
- Expanding page tests specifically for ColorPicker E2E selectors

## Current state

In `qr-code-generator-page.tsx`, both color fields use:

```tsx
<FormControls.Input
  label="Foreground" // or Background
  type="color"
  value={foreground} // or background
  onChange={(e) => setForeground(e.target.value)}
  isFluid
  margin="0"
  dataTestId="qr-foreground" // or qr-background
/>
```

Hook state and `generate-qr-code` validation already expect `#RRGGBB` hex strings.

## Target API

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
```

Same pattern for Background with `setBackground` / `dataTestId="qr-background"`.

### Behavior notes

- ColorPicker emits normalized `#RRGGBB` (uppercase). Existing `normalizeHexColor` lowercases before use — compatible.
- `onChange` type is `(color: string | null) => void`. With `clearable={false}`, null should not occur in normal UI; the `if (color)` guard is defensive only.
- Preserve existing `dataTestId` values so selectors stay stable (`qr-foreground`, `qr-background`). ColorPicker places the root id on the field wrapper and adds suffixes (`-trigger`, `-swatch`, etc.).

## Files to touch

| File | Change |
|------|--------|
| `app/package.json` | Bump `cleanplate` to `^0.3.35` |
| `app/package-lock.json` | Refresh via install |
| `app/src/features/qr-code-generator/qr-code-generator-page.tsx` | Swap Input → ColorPicker |

## Verification

- `npm install` in `app/` succeeds at cleanplate ≥ 0.3.35
- Typecheck / build pass with `FormControls.ColorPicker`
- Existing unit tests still pass
- Manually: open QR generator, pick foreground/background via ColorPicker, generate, confirm colors apply

## Risks

| Risk | Mitigation |
|------|------------|
| ColorPicker layout wider than native color input in options row | Accept default fluid layout; no CSS change unless broken |
| Null `onChange` if clear somehow fires | `clearable={false}` + `if (color)` guard |
