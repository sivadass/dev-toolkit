# DevToolkit App Shell + Image Compressor — Design Spec

**Date:** 2026-08-05  
**Status:** Approved for implementation planning  
**Scope:** Bootstrap production React app (`app/`) with shared shell; fully implement Image compressor; placeholders for other tools. Keep `design/` as visual/IA reference only.

## Goal

Ship a Vite + React + TypeScript SPA that:

1. Provides a durable app shell (home discovery + tool layout) using **CleanPlate** from npm.
2. Fully implements **Image compressor** client-side (quality, max dimension, format conversion, preview, download).
3. Registers remaining toolkit tools on home and in the sidebar with **Coming soon** placeholder pages.

## Product decisions

| Decision | Choice |
|----------|--------|
| App location | New `app/` at repo root; keep `design/` untouched |
| UI framework | [cleanplate](https://www.npmjs.com/package/cleanplate) from npm (pinned) |
| Prototype role | Layout/IA and light brand cues only — not CSS port |
| Branding depth | Light: wordmark + `--primary-brand` override; CleanPlate defaults otherwise |
| Routing | React Router |
| Global state | **No Zustand** in v1; local React state / hooks for compressor |
| Compression engine | Browser `createImageBitmap` / canvas + `canvas.toBlob` (no compression library) |
| Other tools | Listed on home; routes exist; `FeedbackState` “Coming soon” |
| Themes | Light only; CleanPlate tokens allow later themes |

## Out of scope

- Zustand, accounts, analytics, SEO marketing site
- Real logic for QR, JSON/Text comparer, Base64
- Dark / high-contrast themes
- WASM encoders, batch compression, guaranteed EXIF stripping beyond canvas re-encode
- Deploy pipeline / hosting (static `vite build` only)
- Porting `design/` CSS into the app

## Architecture

### Approach

Feature-sliced Vite SPA. A single **tools registry** drives the home grid, routes, and tool sidebar. Home uses CleanPlate layout primitives without a sidebar. Tool routes wrap content in CleanPlate `AppShell` (header + sidebar; mobile drawer via AppShell). Image compressor is an isolated feature module with a pure compress util and a thin page/hook layer.

**Routing**

| Path | Page |
|------|------|
| `/` | `HomeLayout` → `HomePage` |
| `/tools/image-compressor` | `ToolLayout` → `ImageCompressorPage` |
| `/tools/:toolId` | `ToolLayout` → `ComingSoonPage` when registry status is `coming-soon`; else not-found |
| `*` | `NotFoundPage` |

`image-compressor` uses a dedicated route declaration **above** the parametric route so it never hits Coming soon.
### Tools registry

Single module (e.g. `app/src/config/tools.ts`) exports:

| Field | Purpose |
|-------|---------|
| `id` | Stable slug (`image-compressor`, `qr-code-generator`, …) |
| `title` | Display name |
| `description` | Short home-card copy |
| `icon` | Material Symbols name for CleanPlate `Icon` / menu |
| `path` | Absolute route path |
| `status` | `"ready"` \| `"coming-soon"` |

v1 registry tools (match prototype IA):

1. Image compressor — `ready`
2. QR Code generator — `coming-soon`
3. JSON comparer — `coming-soon`
4. Text comparer — `coming-soon`
5. Base64 — `coming-soon`

### Shell behavior

**Home**

- Header: DevToolkit wordmark linking to `/`. No sidebar.
- Main: kicker + headline + lead + grid of tool cards (all registry entries link to their paths).
- Search UI may be omitted or visually deferred; not required for v1.

**Tool pages**

- CleanPlate `AppShell` with:
  - `header` as **HeaderProps** (not a custom node): wordmark via `headerLeft`, “All tools” link in `headerRight`, `showCenterMenu: false`, same `menuItems` as the sidebar so the header’s built-in mobile menu lists tools below 1024px
  - `sidebar`: all tools as `MenuList` items; `activeItem` from current route; `onMenuClick` navigates via React Router
  - Leave `mobileSidebarDrawer` at AppShell default for HeaderProps (`false`) so mobile nav is the header menu, not a second drawer
- Active tool content in main region via React Router `<Outlet />`.

**Coming soon**

- Route `/tools/:toolId`: if `toolId` is in the registry and `status === "coming-soon"`, render CleanPlate `FeedbackState` `variant="empty"` with that tool’s title, description “Coming soon — this tool is not built yet.”, and primary action navigating to `/`.
- If `toolId === "image-compressor"` (or any `ready` tool), render that tool’s page (dedicated route preferred for the compressor).
- If `toolId` is not in the registry → not-found.

### Branding & styles

1. Import `cleanplate/dist/index.css` once at app root.
2. Load fonts: Inter (UI), Material Symbols (icons), DM Serif Display (wordmark only).
3. `brand.css` after CleanPlate CSS: set `--primary-brand: #0c0a5d` only. CleanPlate already derives `--primary-brand-*` and `--text-interactive` from that token. Do **not** recreate floating shell, blobs, or pill sidebar chrome from `design/`.
4. Prefer CleanPlate props for spacing/alignment; avoid inline styles when a prop exists (per CleanPlate `AGENTS.md`).
5. Copy CleanPlate agent guidance into `app/AGENTS.md` so codegen stays aligned.

### State management

- **No Zustand** in this slice.
- Image compressor: hook `useImageCompressor` in `use-image-compressor.ts` holds file, options, result, error, busy flag; creates/revokes object URLs.
- Shell: route-derived active tool only; no global UI store.

## Image compressor

### Acceptance criteria

- User can select one image (PNG, JPEG, WebP, GIF as **decode** inputs). Animated GIF becomes a **single frame** after canvas encode — show a short UI hint.
- User can set **quality** (integer 1–100 via `FormControls.Stepper`), **max dimension** (longest side in px via Stepper; `0` or empty = no limit), and **output format** (`FormControls.Select`: `image/webp` | `image/jpeg` | `image/png`).
- Compress runs entirely in the browser; privacy copy states files never leave the device.
- Side-by-side Original / Compressed previews with dimensions and human-readable sizes.
- Download of compressed blob with a sensible filename (e.g. `name.compressed.webp`).
- Savings summary after success (percent and/or absolute).
- Clear errors for: oversize file, unsupported type, decode failure, encode failure.
- Compress disabled until a valid file is present; loading state on Compress while work runs.

### Constraints

| Constraint | Value |
|------------|--------|
| Max input size | 10 MB |
| Cardinality | Single file |
| Quality | Applied for JPEG/WebP; PNG quality ignored by browsers — UI hint explains this |
| Resize | Fit inside max longest side; preserve aspect ratio; never upscale |
| Privacy | No upload / network for image bytes |

### Pipeline (`compress-image.ts`)

Pure async function (no React):

1. Validate MIME / size.
2. Decode via `createImageBitmap(file)`. On failure, reject with a decode error (no HTMLImageElement fallback in v1).
3. Compute target width/height from max dimension (`0` / unset = keep source size; never upscale).
4. Draw to canvas (2d).
5. `canvas.toBlob(mimeType, quality01)` where `quality01 = quality / 100` for JPEG/WebP; omit or ignore quality for PNG.
6. Return `{ blob, width, height, mimeType }` and `bitmap.close()`.
7. Caller builds object URLs and download names.

Keep the function unit-testable with mocked canvas / `toBlob` where the environment lacks full canvas support.

### UI composition (CleanPlate)

- `PageHeader`: title, privacy hint, Compress CTA (`isLoading` while busy; `isDisabled` when no file).
- `FormControls.File` `variant="card"`, `multiple={false}`, accept `image/png,image/jpeg,image/webp,image/gif`.
- `FormControls.Stepper` for quality (1–100, default 80) and max dimension (default 1920; allow 0 = unlimited).
- `FormControls.Select` for output format (default `image/webp`).
- Preview panes: two `Container`s (Original | Compressed) with `Typography` meta and `<img>` previews.
- Inline `Alert` for recoverable errors. Compressed pane shows muted “Compress to preview” copy until first success.

### Error handling

| Case | UX |
|------|-----|
| File &gt; 10 MB | Error message; do not keep file |
| Wrong type | Error; reject |
| Decode fail | Error Alert |
| Encode fail / null blob | Error Alert |
| User removes file | Clear result + revoke URLs |

## File structure

```
app/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  AGENTS.md
  src/
    main.tsx
    app.tsx
    styles/
      brand.css
    config/
      tools.ts
    layouts/
      home-layout.tsx
      tool-layout.tsx
    pages/
      home-page.tsx
      coming-soon-page.tsx
      not-found-page.tsx
    features/
      image-compressor/
        image-compressor-page.tsx
        compress-image.ts
        compress-image.test.ts
        use-image-compressor.ts
```

Filenames: **kebab-case** per repo Cursor rule. Component exports may use PascalCase.

Repo root: update main `README.md` to describe `app/` as the product and `design/` as the prototype. Do not delete `design/`.

## Testing & verification

- **Unit:** `compress-image` — resize math, MIME validation, quality passed to `toBlob`, PNG path.
- **Component smoke:** Home renders all tools; compressor page renders controls; coming-soon renders for a placeholder id.
- **Manual:** PNG→WebP, JPEG quality change, max-dimension shrink, download, mobile nav, oversize rejection.
- **Gate:** `npm run typecheck` (or `tsc --noEmit`), `npm test`, `npm run build` inside `app/`.

## Dependencies (v1)

| Package | Role |
|---------|------|
| `react`, `react-dom` | UI |
| `cleanplate` | Components + base CSS |
| `react-router` (v6/v7 as current Vite template) | Routing |
| `vite`, `@vitejs/plugin-react` | Build |
| `typescript` | Types |
| `vitest`, `@testing-library/react`, `jsdom` | Tests |

Explicitly **not** added: `zustand`, image-compression libraries.

## Success criteria

- `app/` boots with `npm install && npm run dev`.
- Home lists five tools; Image compressor works end-to-end locally; others show Coming soon.
- Design prototype remains available under `design/` unchanged by this work (except docs/README pointers).
- No image bytes leave the browser during compress/download flow.
