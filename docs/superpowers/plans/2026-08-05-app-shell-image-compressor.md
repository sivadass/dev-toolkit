# App Shell + Image Compressor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap a Vite + React + TypeScript SPA in `app/` with CleanPlate shell/routing, fully implement client-side Image compressor, and ship Coming soon placeholders for the other toolkit tools.

**Architecture:** Feature-sliced SPA. A tools registry drives home, sidebar, and routes. Home uses CleanPlate without a sidebar; tool routes use `AppShell` + header mobile menu. Compression is a pure `compress-image` util (canvas/`toBlob`) wired through `useImageCompressor` into the page. No Zustand.

**Tech Stack:** React 18+, TypeScript, Vite, React Router, CleanPlate `0.3.34`, Vitest, Testing Library. Spec: `docs/superpowers/specs/2026-08-05-app-shell-image-compressor-design.md`.

## Global Constraints

- Filenames: **kebab-case** only (repo Cursor rule)
- App lives in `app/`; do **not** modify or delete `design/` HTML/CSS (README pointers only at repo root)
- UI via **CleanPlate** from npm (`cleanplate@0.3.34`); import `cleanplate/dist/index.css` once
- Light branding only: `--primary-brand: #0c0a5d` in `brand.css`; no floating-shell / blob recreation
- **No Zustand**; no image-compression libraries
- CleanPlate spacing: suffix-only props (`margin="b-2"`) — never pass `m-` / `p-` prefixes
- Product name: **DevToolkit**
- Max input image size: **10 MB**
- Before inventing CleanPlate props, read `node_modules/cleanplate/docs/<Component>.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `app/package.json` | Scripts + deps |
| `app/vite.config.ts` | Vite + React + Vitest |
| `app/tsconfig*.json` | TypeScript |
| `app/index.html` | SPA shell + font links |
| `app/AGENTS.md` | CleanPlate agent rules for this app |
| `app/src/main.tsx` | Bootstrap |
| `app/src/app.tsx` | Router tree |
| `app/src/styles/brand.css` | `--primary-brand` + wordmark font helper |
| `app/src/styles/app.css` | Minimal layout helpers (tool grid, preview panes) |
| `app/src/config/tools.ts` | Tools registry + lookup helpers |
| `app/src/config/tools.test.ts` | Registry lookup tests |
| `app/src/layouts/home-layout.tsx` | Home chrome (header, no sidebar) |
| `app/src/layouts/tool-layout.tsx` | AppShell + sidebar + outlet |
| `app/src/pages/home-page.tsx` | Tool discovery grid |
| `app/src/pages/coming-soon-page.tsx` | FeedbackState placeholder |
| `app/src/pages/not-found-page.tsx` | 404 |
| `app/src/pages/home-page.test.tsx` | Smoke: five tools listed |
| `app/src/pages/coming-soon-page.test.tsx` | Smoke: coming soon copy |
| `app/src/features/image-compressor/compress-image.ts` | Pure compress pipeline |
| `app/src/features/image-compressor/compress-image.test.ts` | Unit tests |
| `app/src/features/image-compressor/use-image-compressor.ts` | Local state + object URLs |
| `app/src/features/image-compressor/image-compressor-page.tsx` | Full UI |
| `app/src/features/image-compressor/image-compressor-page.test.tsx` | Smoke render |
| `app/src/lib/format-bytes.ts` | Human-readable sizes |
| `README.md` (repo root) | Point at `app/` + `design/` |

---

### Task 1: Scaffold Vite app, CleanPlate, Vitest

**Files:**
- Create: `app/package.json`, `app/vite.config.ts`, `app/tsconfig.json`, `app/tsconfig.app.json`, `app/tsconfig.node.json`, `app/index.html`, `app/src/main.tsx`, `app/src/app.tsx`, `app/src/styles/brand.css`, `app/src/styles/app.css`, `app/src/vite-env.d.ts`, `app/AGENTS.md`
- Modify: `README.md` (repo root)

**Interfaces:**
- Consumes: none
- Produces: runnable Vite app importing CleanPlate CSS; `npm run dev` / `test` / `build` / `typecheck` scripts

- [ ] **Step 1: Scaffold with Vite**

From repo root:

```bash
npm create vite@latest app -- --template react-ts
```

If interactive prompts appear, accept defaults for the React-TS template. Then remove unused Vite starter assets you will not need (`src/App.css`, `src/assets/react.svg`, default `App.tsx` content will be replaced in later steps).

- [ ] **Step 2: Install runtime + test dependencies**

```bash
cd app
npm install cleanplate@0.3.34 react-router-dom
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Pin `react` / `react-dom` to whatever the Vite template installed (must be ≥18 for CleanPlate peers).

- [ ] **Step 3: Configure Vitest in `vite.config.ts`**

Replace `app/vite.config.ts` with:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
    globals: true,
  },
});
```

Create `app/src/test-setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add scripts to `app/package.json` (merge with existing):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Ensure `tsconfig` / `tsconfig.app.json` include Vitest types if needed (`"types": ["vite/client", "vitest/globals"]` in the app tsconfig that covers `src`).

- [ ] **Step 4: Wire entry HTML, styles, and stub app**

`app/index.html` — ensure root mount and fonts:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevToolkit</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`app/src/styles/brand.css`:

```css
:root {
  --primary-brand: #0c0a5d;
}

.brand-wordmark {
  font-family: "DM Serif Display", serif;
  font-size: 1.25rem;
  color: var(--text-default);
  text-decoration: none;
}

.brand-wordmark__accent {
  color: var(--primary-brand);
}
```

`app/src/styles/app.css`:

```css
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.tool-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: var(--space-4);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-large);
  background: var(--white);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.tool-card-link:hover,
.tool-card-link:focus-visible {
  border-color: var(--primary-brand);
  outline: none;
}

.preview-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

@media (min-width: 768px) {
  .preview-split {
    grid-template-columns: 1fr 1fr;
  }
}

.preview-pane {
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-large);
  padding: var(--space-4);
  background: var(--white);
  min-height: 200px;
}

.preview-pane img {
  display: block;
  max-width: 100%;
  height: auto;
  margin-top: var(--space-3);
}

.options-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

@media (min-width: 768px) {
  .options-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

`app/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "cleanplate/dist/index.css";
import "./styles/brand.css";
import "./styles/app.css";
import { App } from "./app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

`app/src/app.tsx` (temporary stub — replaced in Task 3):

```tsx
import { Typography, Container } from "cleanplate";

export function App() {
  return (
    <Container padding="6">
      <Typography variant="h1">DevToolkit</Typography>
      <Typography variant="p" margin="t-2">
        Scaffold OK
      </Typography>
    </Container>
  );
}
```

`app/src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 5: Add `app/AGENTS.md`**

Copy content from CleanPlate’s published `AGENTS.md` (from `node_modules/cleanplate/AGENTS.md` after install) into `app/AGENTS.md` unchanged, or paste the same rules: named imports from `cleanplate`, import CSS once, Material Symbols font, suffix-only spacing, prefer props over inline styles, read `llms.txt` / `docs/*.md` before inventing APIs.

- [ ] **Step 6: Update repo root `README.md`**

```md
# DevToolkit

Free client-side developer tools. Files never leave your browser.

## App (production)

```bash
cd app
npm install
npm run dev
```

## Design prototype

Static HTML reference lives in [`design/`](./design/). See [`design/README.md`](./design/README.md).
```

- [ ] **Step 7: Verify scaffold**

```bash
cd app && npm run typecheck && npm run build && npm run dev
```

Expected: typecheck + build succeed; dev server shows “DevToolkit / Scaffold OK”. Stop the dev server after checking.

- [ ] **Step 8: Commit**

```bash
git add app README.md
git commit -m "$(cat <<'EOF'
feat(app): scaffold Vite React app with CleanPlate

Bootstrap the production SPA with CleanPlate styles, Vitest, and brand token override.
EOF
)"
```

---

### Task 2: Tools registry

**Files:**
- Create: `app/src/config/tools.ts`, `app/src/config/tools.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `export type ToolStatus = "ready" | "coming-soon"`
  - `export interface ToolDefinition { id: string; title: string; description: string; icon: string; path: string; status: ToolStatus }`
  - `export const TOOLS: ToolDefinition[]`
  - `export function getToolById(id: string): ToolDefinition | undefined`
  - `export function getToolMenuItems(): { label: string; value: string; icon: string }[]` — `value` is the tool `path`

- [ ] **Step 1: Write failing registry tests**

Create `app/src/config/tools.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TOOLS, getToolById, getToolMenuItems } from "./tools";

describe("tools registry", () => {
  it("lists five tools with image compressor ready", () => {
    expect(TOOLS).toHaveLength(5);
    expect(getToolById("image-compressor")?.status).toBe("ready");
    expect(getToolById("qr-code-generator")?.status).toBe("coming-soon");
  });

  it("returns menu items with path values", () => {
    const items = getToolMenuItems();
    expect(items[0]).toEqual({
      label: "Image compressor",
      value: "/tools/image-compressor",
      icon: "image",
    });
  });

  it("returns undefined for unknown ids", () => {
    expect(getToolById("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
cd app && npm test -- src/config/tools.test.ts
```

Expected: FAIL — module not found / exports missing.

- [ ] **Step 3: Implement registry**

Create `app/src/config/tools.ts`:

```ts
export type ToolStatus = "ready" | "coming-soon";

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  status: ToolStatus;
}

export const TOOLS: ToolDefinition[] = [
  {
    id: "image-compressor",
    title: "Image compressor",
    description: "Shrink PNG & JPG locally",
    icon: "image",
    path: "/tools/image-compressor",
    status: "ready",
  },
  {
    id: "qr-code-generator",
    title: "QR Code generator",
    description: "Create downloadable QR codes",
    icon: "qr_code_2",
    path: "/tools/qr-code-generator",
    status: "coming-soon",
  },
  {
    id: "json-comparer",
    title: "JSON comparer",
    description: "Diff two JSON payloads",
    icon: "data_object",
    path: "/tools/json-comparer",
    status: "coming-soon",
  },
  {
    id: "text-comparer",
    title: "Text comparer",
    description: "Side-by-side text diff",
    icon: "compare_arrows",
    path: "/tools/text-comparer",
    status: "coming-soon",
  },
  {
    id: "base64",
    title: "Base64",
    description: "Encode and decode strings",
    icon: "code",
    path: "/tools/base64",
    status: "coming-soon",
  },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getToolMenuItems() {
  return TOOLS.map((tool) => ({
    label: tool.title,
    value: tool.path,
    icon: tool.icon,
  }));
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd app && npm test -- src/config/tools.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/config/tools.ts app/src/config/tools.test.ts
git commit -m "$(cat <<'EOF'
feat(app): add tools registry for navigation and routes

Centralize tool metadata so home, sidebar, and placeholders stay in sync.
EOF
)"
```

---

### Task 3: Routing, layouts, home, placeholders

**Files:**
- Create: `app/src/layouts/home-layout.tsx`, `app/src/layouts/tool-layout.tsx`, `app/src/pages/home-page.tsx`, `app/src/pages/coming-soon-page.tsx`, `app/src/pages/not-found-page.tsx`, `app/src/pages/home-page.test.tsx`, `app/src/pages/coming-soon-page.test.tsx`
- Modify: `app/src/app.tsx`
- Create stub (temporary): `app/src/features/image-compressor/image-compressor-page.tsx` exporting a placeholder page until Task 6

**Interfaces:**
- Consumes: `TOOLS`, `getToolById`, `getToolMenuItems` from `config/tools.ts`
- Produces: route tree in `App`; `HomeLayout`, `ToolLayout`, pages as named exports

- [ ] **Step 1: Write failing home + coming-soon smoke tests**

`app/src/pages/home-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomePage } from "./home-page";

describe("HomePage", () => {
  it("lists all five tools", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /image compressor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /qr code/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /json comparer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /text comparer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /base64/i })).toBeInTheDocument();
  });
});
```

`app/src/pages/coming-soon-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ComingSoonPage } from "./coming-soon-page";

describe("ComingSoonPage", () => {
  it("shows coming soon for a registered tool", () => {
    render(
      <MemoryRouter initialEntries={["/tools/base64"]}>
        <Routes>
          <Route path="/tools/:toolId" element={<ComingSoonPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Base64")).toBeInTheDocument();
    expect(screen.getByText(/coming soon — this tool is not built yet/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect fail**

```bash
cd app && npm test -- src/pages/home-page.test.tsx src/pages/coming-soon-page.test.tsx
```

Expected: FAIL — modules missing.

- [ ] **Step 3: Implement layouts and pages**

`app/src/layouts/home-layout.tsx`:

```tsx
import { Container, Header } from "cleanplate";
import { Link, Outlet } from "react-router-dom";

function BrandLink() {
  return (
    <Link to="/" className="brand-wordmark">
      Dev<span className="brand-wordmark__accent">Toolkit</span>
    </Link>
  );
}

export function HomeLayout() {
  return (
    <>
      <Header
        menuItems={[]}
        showCenterMenu={false}
        headerLeft={<BrandLink />}
        size="medium"
        variant="light"
      />
      <Container padding="6" isFluid={false}>
        <Outlet />
      </Container>
    </>
  );
}
```

> If CleanPlate `Header` requires non-empty `menuItems`, pass a single dummy item with `showCenterMenu={false}` or check `docs/Header.md` after install and adjust to the typed API. Prefer empty array if types allow.

`app/src/layouts/tool-layout.tsx`:

```tsx
import { AppShell, Button } from "cleanplate";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getToolMenuItems } from "../config/tools";

function BrandLink() {
  return (
    <Link to="/" className="brand-wordmark">
      Dev<span className="brand-wordmark__accent">Toolkit</span>
    </Link>
  );
}

export function ToolLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = getToolMenuItems();

  return (
    <AppShell
      header={{
        menuItems,
        showCenterMenu: false,
        activeMenuItem: location.pathname,
        onMenuItemClick: (item) => navigate(String(item.value)),
        headerLeft: <BrandLink />,
        headerRight: (
          <Button variant="ghost" size="small" onClick={() => navigate("/")}>
            All tools
          </Button>
        ),
        size: "medium",
        variant: "light",
      }}
      sidebar={{
        items: menuItems,
        activeItem: location.pathname,
        onMenuClick: (item) => navigate(String(item.value)),
        variant: "light",
        size: "medium",
      }}
      sidebarWidth="240px"
    >
      <Outlet />
    </AppShell>
  );
}
```

`app/src/pages/home-page.tsx`:

```tsx
import { Icon, Typography } from "cleanplate";
import { Link } from "react-router-dom";
import { TOOLS } from "../config/tools";

export function HomePage() {
  return (
    <>
      <Typography variant="small" margin="0">
        Client-side · Private
      </Typography>
      <Typography variant="h1" margin="t-2">
        Tools that stay in your browser
      </Typography>
      <Typography variant="p" margin="t-2">
        Compress, compare, encode — free utilities that never upload your data.
      </Typography>
      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <Link key={tool.id} to={tool.path} className="tool-card-link">
            <Icon name={tool.icon as never} aria-hidden />
            <Typography variant="h4" margin="t-2">
              {tool.title}
            </Typography>
            <Typography variant="small" margin="t-1">
              {tool.description}
            </Typography>
          </Link>
        ))}
      </div>
    </>
  );
}
```

> After install, type `Icon` `name` against `MaterialIconName` from `cleanplate`. If `as never` is needed only temporarily, replace with satisfies / typed icon names from the registry.

`app/src/pages/coming-soon-page.tsx`:

```tsx
import { FeedbackState } from "cleanplate";
import { useNavigate, useParams } from "react-router-dom";
import { getToolById } from "../config/tools";
import { NotFoundPage } from "./not-found-page";

export function ComingSoonPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const tool = toolId ? getToolById(toolId) : undefined;

  if (!tool || tool.status !== "coming-soon") {
    return <NotFoundPage />;
  }

  return (
    <FeedbackState
      variant="empty"
      title={tool.title}
      description="Coming soon — this tool is not built yet."
      icon={tool.icon as never}
      primaryAction={{ label: "All tools", onClick: () => navigate("/") }}
      margin="4"
    />
  );
}
```

`app/src/pages/not-found-page.tsx`:

```tsx
import { FeedbackState } from "cleanplate";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <FeedbackState
      variant="error"
      title="Page not found"
      description="That tool or page does not exist."
      icon="search_off"
      primaryAction={{ label: "Go home", onClick: () => navigate("/") }}
      margin="4"
    />
  );
}
```

Temporary stub `app/src/features/image-compressor/image-compressor-page.tsx`:

```tsx
import { Typography } from "cleanplate";

export function ImageCompressorPage() {
  return <Typography variant="h1">Image compressor</Typography>;
}
```

`app/src/app.tsx`:

```tsx
import { Route, Routes } from "react-router-dom";
import { ImageCompressorPage } from "./features/image-compressor/image-compressor-page";
import { HomeLayout } from "./layouts/home-layout";
import { ToolLayout } from "./layouts/tool-layout";
import { ComingSoonPage } from "./pages/coming-soon-page";
import { HomePage } from "./pages/home-page";
import { NotFoundPage } from "./pages/not-found-page";

export function App() {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      <Route path="/tools" element={<ToolLayout />}>
        <Route path="image-compressor" element={<ImageCompressorPage />} />
        <Route path=":toolId" element={<ComingSoonPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

- [ ] **Step 4: Run page tests + typecheck**

```bash
cd app && npm test -- src/pages && npm run typecheck
```

Expected: PASS. Fix Header `menuItems` typing / Icon names if typecheck fails by consulting `node_modules/cleanplate/docs/Header.md` and `Icon.md`.

- [ ] **Step 5: Manual smoke**

```bash
cd app && npm run dev
```

Check: `/` shows five cards; `/tools/base64` shows Coming soon; `/tools/image-compressor` shows stub title; sidebar/header navigates. Stop server.

- [ ] **Step 6: Commit**

```bash
git add app/src
git commit -m "$(cat <<'EOF'
feat(app): add shell routes, home grid, and coming-soon pages

Wire React Router with CleanPlate AppShell and registry-driven navigation.
EOF
)"
```

---

### Task 4: Pure `compress-image` util (TDD)

**Files:**
- Create: `app/src/lib/format-bytes.ts`, `app/src/features/image-compressor/compress-image.ts`, `app/src/features/image-compressor/compress-image.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `formatBytes(bytes: number): string`
  - `export const MAX_INPUT_BYTES = 10 * 1024 * 1024`
  - `export const ACCEPTED_INPUT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const`
  - `export type OutputMimeType = "image/webp" | "image/jpeg" | "image/png"`
  - `export interface CompressImageOptions { quality: number; maxDimension: number; outputType: OutputMimeType }` — `quality` is 1–100; `maxDimension` `0` = no limit
  - `export interface CompressImageResult { blob: Blob; width: number; height: number; mimeType: OutputMimeType }`
  - `export function computeTargetSize(width: number, height: number, maxDimension: number): { width: number; height: number }`
  - `export function validateImageFile(file: File): string | null` — returns error message or `null`
  - `export async function compressImage(file: File, options: CompressImageOptions): Promise<CompressImageResult>`
  - `export function buildDownloadName(originalName: string, mimeType: OutputMimeType): string`

- [ ] **Step 1: Write failing tests**

`app/src/features/image-compressor/compress-image.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  buildDownloadName,
  computeTargetSize,
  compressImage,
  validateImageFile,
  MAX_INPUT_BYTES,
} from "./compress-image";

describe("computeTargetSize", () => {
  it("keeps size when maxDimension is 0", () => {
    expect(computeTargetSize(4000, 3000, 0)).toEqual({ width: 4000, height: 3000 });
  });

  it("scales down longest side and never upscales", () => {
    expect(computeTargetSize(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
    expect(computeTargetSize(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
});

describe("validateImageFile", () => {
  it("rejects oversized files", () => {
    const file = new File([new Uint8Array(MAX_INPUT_BYTES + 1)], "big.png", {
      type: "image/png",
    });
    expect(validateImageFile(file)).toMatch(/10 MB/i);
  });

  it("rejects unsupported types", () => {
    const file = new File(["x"], "x.txt", { type: "text/plain" });
    expect(validateImageFile(file)).toMatch(/unsupported/i);
  });

  it("accepts png under limit", () => {
    const file = new File(["x"], "x.png", { type: "image/png" });
    expect(validateImageFile(file)).toBeNull();
  });
});

describe("buildDownloadName", () => {
  it("uses compressed suffix and extension", () => {
    expect(buildDownloadName("photo.JPEG", "image/webp")).toBe("photo.compressed.webp");
    expect(buildDownloadName("a.png", "image/jpeg")).toBe("a.compressed.jpg");
    expect(buildDownloadName("a.png", "image/png")).toBe("a.compressed.png");
  });
});

describe("compressImage", () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap;
  const originalDocument = globalThis.document;

  beforeEach(() => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({
        width: 100,
        height: 50,
        close: vi.fn(),
      }))
    );

    const toBlob = vi.fn((type: string, _q?: number) => {
      // emulate async browser callback
    });

    class FakeCanvas {
      width = 0;
      height = 0;
      getContext() {
        return { drawImage: vi.fn() };
      }
      toBlob(callback: BlobCallback, type?: string, quality?: number) {
        toBlob(type ?? "", quality);
        callback(new Blob(["fake"], { type: type ?? "image/webp" }));
      }
    }

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") return new FakeCanvas() as unknown as HTMLCanvasElement;
      return originalDocument.createElement.call(document, tag);
    });

    (compressImage as unknown as { _toBlobSpy?: typeof toBlob })._toBlobSpy = toBlob;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    globalThis.createImageBitmap = originalCreateImageBitmap;
  });

  it("draws resized bitmap and returns blob", async () => {
    const file = new File(["x"], "x.png", { type: "image/png" });
    const result = await compressImage(file, {
      quality: 80,
      maxDimension: 50,
      outputType: "image/webp",
    });
    expect(result.width).toBe(50);
    expect(result.height).toBe(25);
    expect(result.mimeType).toBe("image/webp");
    expect(result.blob.type).toBe("image/webp");
  });

  it("passes quality/100 for jpeg", async () => {
    const file = new File(["x"], "x.jpg", { type: "image/jpeg" });
    const toBlobCalls: Array<{ type?: string; q?: number }> = [];

    class FakeCanvas {
      width = 0;
      height = 0;
      getContext() {
        return { drawImage: vi.fn() };
      }
      toBlob(callback: BlobCallback, type?: string, quality?: number) {
        toBlobCalls.push({ type, q: quality });
        callback(new Blob(["fake"], { type: type ?? "image/jpeg" }));
      }
    }

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") return new FakeCanvas() as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    await compressImage(file, {
      quality: 80,
      maxDimension: 0,
      outputType: "image/jpeg",
    });
    expect(toBlobCalls[0]?.type).toBe("image/jpeg");
    expect(toBlobCalls[0]?.q).toBeCloseTo(0.8);
  });

  it("omits quality for png", async () => {
    const file = new File(["x"], "x.png", { type: "image/png" });
    const toBlobCalls: Array<{ type?: string; args: unknown[] }> = [];

    class FakeCanvas {
      width = 0;
      height = 0;
      getContext() {
        return { drawImage: vi.fn() };
      }
      toBlob(callback: BlobCallback, type?: string, quality?: number) {
        toBlobCalls.push({ type, args: [type, quality] });
        callback(new Blob(["fake"], { type: "image/png" }));
      }
    }

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") return new FakeCanvas() as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    await compressImage(file, {
      quality: 80,
      maxDimension: 0,
      outputType: "image/png",
    });
    expect(toBlobCalls[0]?.args[1]).toBeUndefined();
  });
});
```

Simplify the first `compressImage` test’s spy setup if redundant with later tests — keep assertions on size math + return shape. If `createImageBitmap` mock typing fights TypeScript, cast the stub as `typeof createImageBitmap`.

Also add `app/src/lib/format-bytes.ts` tests inline in the same file or a tiny `format-bytes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatBytes } from "../../lib/format-bytes";

describe("formatBytes", () => {
  it("formats B KB MB", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
```

(Place this describe in `compress-image.test.ts` or separate file — either is fine.)

- [ ] **Step 2: Run tests — expect fail**

```bash
cd app && npm test -- src/features/image-compressor/compress-image.test.ts
```

Expected: FAIL — module missing.

- [ ] **Step 3: Implement util + formatBytes**

`app/src/lib/format-bytes.ts`:

```ts
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

`app/src/features/image-compressor/compress-image.ts`:

```ts
export const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_INPUT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export type OutputMimeType = "image/webp" | "image/jpeg" | "image/png";

export interface CompressImageOptions {
  quality: number;
  maxDimension: number;
  outputType: OutputMimeType;
}

export interface CompressImageResult {
  blob: Blob;
  width: number;
  height: number;
  mimeType: OutputMimeType;
}

export function computeTargetSize(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (!maxDimension || maxDimension <= 0) {
    return { width, height };
  }
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_INPUT_BYTES) {
    return "Image must be 10 MB or smaller.";
  }
  if (!ACCEPTED_INPUT_TYPES.includes(file.type as (typeof ACCEPTED_INPUT_TYPES)[number])) {
    return "Unsupported file type. Use PNG, JPEG, WebP, or GIF.";
  }
  return null;
}

export function buildDownloadName(originalName: string, mimeType: OutputMimeType): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  const ext =
    mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : "webp";
  return `${base}.compressed.${ext}`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: OutputMimeType,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const quality01 = type === "image/png" ? undefined : quality / 100;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not encode image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality01
    );
  });
}

export async function compressImage(
  file: File,
  options: CompressImageOptions
): Promise<CompressImageResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Could not read this image.");
  }

  try {
    const target = computeTargetSize(bitmap.width, bitmap.height, options.maxDimension);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not available in this browser.");
    }
    ctx.drawImage(bitmap, 0, 0, target.width, target.height);
    const blob = await canvasToBlob(canvas, options.outputType, options.quality);
    return {
      blob,
      width: target.width,
      height: target.height,
      mimeType: options.outputType,
    };
  } finally {
    bitmap.close();
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd app && npm test -- src/features/image-compressor/compress-image.test.ts src/lib/format-bytes.test.ts
```

If `format-bytes` tests live inside the compress test file, run that file only. Fix mocks until all assertions pass.

- [ ] **Step 5: Commit**

```bash
git add app/src/lib/format-bytes.ts app/src/features/image-compressor/compress-image.ts app/src/features/image-compressor/compress-image.test.ts
git commit -m "$(cat <<'EOF'
feat(app): add canvas-based image compression utility

Validate inputs, resize by max dimension, and encode via canvas.toBlob.
EOF
)"
```

---

### Task 5: `useImageCompressor` hook

**Files:**
- Create: `app/src/features/image-compressor/use-image-compressor.ts`
- Optional test: `app/src/features/image-compressor/use-image-compressor.test.ts` (renderHook)

**Interfaces:**
- Consumes: `compressImage`, `validateImageFile`, `buildDownloadName`, `OutputMimeType`, `CompressImageResult`
- Produces: `useImageCompressor()` returning:
  - `file: File | null`
  - `setFilesFromControl: (files: File[]) => void` — takes CleanPlate File `onChange` array; keeps first file or clears
  - `quality: number` / `setQuality`
  - `maxDimension: number` / `setMaxDimension`
  - `outputType: OutputMimeType` / `setOutputType`
  - `originalUrl: string | null`
  - `result: (CompressImageResult & { url: string; downloadName: string }) | null`
  - `error: string | null`
  - `isCompressing: boolean`
  - `compress: () => Promise<void>`
  - `clearResult: () => void`
  - Defaults: `quality=80`, `maxDimension=1920`, `outputType="image/webp"`

- [ ] **Step 1: Implement hook**

```ts
import { useCallback, useEffect, useState } from "react";
import {
  buildDownloadName,
  compressImage,
  type CompressImageResult,
  type OutputMimeType,
  validateImageFile,
} from "./compress-image";

export interface CompressorResult extends CompressImageResult {
  url: string;
  downloadName: string;
}

export function useImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxDimension, setMaxDimension] = useState(1920);
  const [outputType, setOutputType] = useState<OutputMimeType>("image/webp");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CompressorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const revokeResultUrl = useCallback((current: CompressorResult | null) => {
    if (current?.url) URL.revokeObjectURL(current.url);
  }, []);

  const setFilesFromControl = useCallback(
    (files: File[]) => {
      setError(null);
      revokeResultUrl(result);
      setResult(null);

      const next = files[0] ?? null;
      if (!next) {
        setFile(null);
        return;
      }
      const validationError = validateImageFile(next);
      if (validationError) {
        setFile(null);
        setError(validationError);
        return;
      }
      setFile(next);
    },
    [result, revokeResultUrl]
  );

  useEffect(() => {
    if (!file) {
      setOriginalUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    return () => {
      revokeResultUrl(result);
    };
  }, [result, revokeResultUrl]);

  const clearResult = useCallback(() => {
    setResult((prev) => {
      revokeResultUrl(prev);
      return null;
    });
  }, [revokeResultUrl]);

  const compress = useCallback(async () => {
    if (!file) return;
    setIsCompressing(true);
    setError(null);
    try {
      const compressed = await compressImage(file, {
        quality,
        maxDimension,
        outputType,
      });
      const url = URL.createObjectURL(compressed.blob);
      setResult((prev) => {
        revokeResultUrl(prev);
        return {
          ...compressed,
          url,
          downloadName: buildDownloadName(file.name, compressed.mimeType),
        };
      });
    } catch (err) {
      setResult((prev) => {
        revokeResultUrl(prev);
        return null;
      });
      setError(err instanceof Error ? err.message : "Compression failed.");
    } finally {
      setIsCompressing(false);
    }
  }, [file, quality, maxDimension, outputType, revokeResultUrl]);

  return {
    file,
    setFilesFromControl,
    quality,
    setQuality,
    maxDimension,
    setMaxDimension,
    outputType,
    setOutputType,
    originalUrl,
    result,
    error,
    isCompressing,
    compress,
    clearResult,
  };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd app && npm run typecheck
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/src/features/image-compressor/use-image-compressor.ts
git commit -m "$(cat <<'EOF'
feat(app): add image compressor state hook

Manage file selection, object URLs, and compress lifecycle without global state.
EOF
)"
```

---

### Task 6: Image compressor page UI

**Files:**
- Modify: `app/src/features/image-compressor/image-compressor-page.tsx` (replace stub)
- Create: `app/src/features/image-compressor/image-compressor-page.test.tsx`
- Consumes CleanPlate: `PageHeader`, `Button`, `FormControls`, `Alert`, `Typography`, `Container` — read `node_modules/cleanplate/docs/PageHeader.md` and `FormControls.md` before coding

**Interfaces:**
- Consumes: `useImageCompressor`, `formatBytes`, `ACCEPTED_INPUT_TYPES`
- Produces: full `ImageCompressorPage` UI per spec

- [ ] **Step 1: Write smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageCompressorPage } from "./image-compressor-page";

describe("ImageCompressorPage", () => {
  it("renders title, file control, and compress action", () => {
    render(<ImageCompressorPage />);
    expect(screen.getByText("Image compressor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compress/i })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run — expect fail or stub mismatch**

```bash
cd app && npm test -- src/features/image-compressor/image-compressor-page.test.tsx
```

Expected: FAIL (Compress button missing / not disabled).

- [ ] **Step 3: Implement page**

Replace `image-compressor-page.tsx` with:

```tsx
import {
  Alert,
  Button,
  FormControls,
  PageHeader,
  Typography,
} from "cleanplate";
import type { Option } from "cleanplate";
import { formatBytes } from "../../lib/format-bytes";
import { ACCEPTED_INPUT_TYPES, type OutputMimeType } from "./compress-image";
import { useImageCompressor } from "./use-image-compressor";

const FORMAT_OPTIONS: Option[] = [
  { label: "WebP", value: "image/webp" },
  { label: "JPEG", value: "image/jpeg" },
  { label: "PNG", value: "image/png" },
];

export function ImageCompressorPage() {
  const {
    file,
    setFilesFromControl,
    quality,
    setQuality,
    maxDimension,
    setMaxDimension,
    outputType,
    setOutputType,
    originalUrl,
    result,
    error,
    isCompressing,
    compress,
  } = useImageCompressor();

  const selectedFormat =
    FORMAT_OPTIONS.find((o) => o.value === outputType) ?? FORMAT_OPTIONS[0];

  const savings =
    file && result
      ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100))
      : null;

  return (
    <>
      <PageHeader
        title="Image compressor"
        subtitle="Compress PNG, JPG, WebP & GIF locally — files never leave your device."
        primaryCta={
          <Button
            variant="solid"
            isLoading={isCompressing}
            isDisabled={!file || isCompressing}
            onClick={() => void compress()}
          >
            Compress
          </Button>
        }
      />

      {error ? <Alert message={error} variant="error" margin="t-4" /> : null}

      <FormControls.File
        label="Image file"
        variant="card"
        multiple={false}
        accept={ACCEPTED_INPUT_TYPES.join(",")}
        value={file ? [file] : []}
        onChange={(files) => setFilesFromControl(files)}
        dropZoneText="Drop an image here"
        buttonLabel="Browse"
        isFluid
        margin="t-4"
        dataTestId="image-file"
      />
      <Typography variant="small" margin="t-2">
        PNG, JPEG, WebP, or GIF up to 10 MB. Animated GIFs become a single frame.
        PNG output ignores the quality setting (browser behavior).
      </Typography>

      <div className="options-row">
        <FormControls.Stepper
          label="Quality"
          value={String(quality)}
          min={1}
          max={100}
          step={1}
          onChange={(e) => setQuality(Number(e.target.value) || 1)}
          isFluid
          dataTestId="quality"
        />
        <FormControls.Stepper
          label="Max dimension (px)"
          value={String(maxDimension)}
          min={0}
          max={10000}
          step={10}
          onChange={(e) => setMaxDimension(Number(e.target.value) || 0)}
          isFluid
          dataTestId="max-dimension"
        />
        <FormControls.Select
          label="Output format"
          options={FORMAT_OPTIONS}
          value={selectedFormat}
          searchable={false}
          onChange={(option) => {
            if (option && !Array.isArray(option)) {
              setOutputType(String(option.value) as OutputMimeType);
            }
          }}
          isFluid
          dataTestId="output-format"
        />
      </div>
      <Typography variant="small" margin="t-2">
        Max dimension 0 = no resize. Longest side is capped; images are never upscaled.
      </Typography>

      <div className="preview-split">
        <div className="preview-pane">
          <Typography variant="h4" margin="0">
            Original
          </Typography>
          {file && originalUrl ? (
            <>
              <Typography variant="small" margin="t-2">
                {file.name} · {formatBytes(file.size)}
              </Typography>
              <img src={originalUrl} alt="Original preview" />
            </>
          ) : (
            <Typography variant="small" margin="t-2">
              Select an image to preview
            </Typography>
          )}
        </div>
        <div className="preview-pane">
          <Typography variant="h4" margin="0">
            Compressed
          </Typography>
          {result ? (
            <>
              <Typography variant="small" margin="t-2">
                {result.width}×{result.height} · {formatBytes(result.blob.size)}
                {savings !== null ? ` · ${savings}% smaller` : ""}
              </Typography>
              <img src={result.url} alt="Compressed preview" />
              <Button
                variant="outline"
                margin="t-4"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = result.url;
                  a.download = result.downloadName;
                  a.click();
                }}
              >
                Download
              </Button>
            </>
          ) : (
            <Typography variant="small" margin="t-2">
              Compress to preview
            </Typography>
          )}
        </div>
      </div>
    </>
  );
}
```

Adjust `FormControls.Stepper` `value`/`onChange` to match the installed CleanPlate types (`string` vs `number`) after reading `FormControls.md` — keep controlled 1–100 / 0–10000 behavior.

If `Option` is not a direct named export, import the type from the path CleanPlate documents or inline `{ label: string; value: string }[]`.

- [ ] **Step 4: Run tests + typecheck**

```bash
cd app && npm test && npm run typecheck
```

Expected: all PASS.

- [ ] **Step 5: Manual E2E checklist in browser**

```bash
cd app && npm run dev
```

1. Drop a PNG → Compress → WebP preview + download  
2. Lower quality on JPEG output → smaller file  
3. Set max dimension 200 → smaller dimensions  
4. File &gt; 10 MB → error, file not kept  
5. Mobile width: header menu lists tools  

- [ ] **Step 6: Commit**

```bash
git add app/src/features/image-compressor
git commit -m "$(cat <<'EOF'
feat(app): implement image compressor page

Add CleanPlate UI for upload, options, side-by-side preview, and download.
EOF
)"
```

---

### Task 7: Final verification gate

**Files:**
- Modify only if fixes needed from verification

- [ ] **Step 1: Full gate**

```bash
cd app && npm test && npm run typecheck && npm run build
```

Expected: all succeed; `dist/` produced.

- [ ] **Step 2: Confirm design/ untouched**

```bash
git status design/
```

Expected: no modifications under `design/` (except if you never touched it — clean).

- [ ] **Step 3: Commit any verification fixes** (only if files changed)

```bash
git add -A app
git commit -m "$(cat <<'EOF'
fix(app): address verification issues from shell and compressor gate
EOF
)"
```

Skip this commit if the working tree is clean.

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| `app/` Vite React TS SPA | 1 |
| CleanPlate from npm + brand token | 1 |
| `AGENTS.md` + root README | 1 |
| Tools registry | 2 |
| Home grid all tools | 3 |
| Tool AppShell + mobile header menu | 3 |
| Coming soon FeedbackState | 3 |
| Dedicated compressor route above `:toolId` | 3 |
| compress canvas pipeline + validation | 4 |
| Hook / no Zustand | 5 |
| Full compressor UI + download + savings | 6 |
| Tests + build gate | 4, 6, 7 |
| `design/` preserved | 7 |

## Self-review notes

- No TBD / “implement later” steps remain.
- Types for `compressImage` / `useImageCompressor` / registry are consistent across tasks.
- CleanPlate prop edge cases (Header empty `menuItems`, Stepper value typing, `Option` import) are called out to resolve against installed `docs/*.md` rather than inventing APIs.
