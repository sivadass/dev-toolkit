# Agent instructions — CleanPlate (React)

Use this file when generating or refactoring UI in **this frontend project**. This app uses **[CleanPlate](https://www.npmjs.com/package/cleanplate)** (`cleanplate` on npm): a headless React component library.

## Where to load full documentation

1. **Index (start here):** `node_modules/cleanplate/llms.txt`  
   Overview, AI-oriented guidelines, and pointers to each component doc.

2. **Component reference:** `node_modules/cleanplate/docs/<ComponentName>.md`  
   Example: `docs/Button.md`, `docs/PageHeader.md` — props, types, examples, behavior.

If `node_modules` is missing, run install first. Optionally use a **semver-pinned CDN** mirror of the same files (substitute your installed version):  
`https://unpkg.com/cleanplate@<version>/llms.txt` · `https://unpkg.com/cleanplate@<version>/docs/Button.md`

Human-facing demos: [Storybook — cleanplate.sivadass.in](https://cleanplate.sivadass.in)

## Imports and styling

- Import components as **named exports** from `'cleanplate'`.
- Include framework styles **once** at the app root:  
  `import "cleanplate/dist/index.css";`
- **`Icon`** uses [Google Material Symbols](https://fonts.google.com/icons); ensure the Material Symbols font is loaded in the app (see `docs/Icon.md`).

## Rules for generated code

- Prefer **component props** for layout, spacing, and alignment — **avoid inline `style`** when CleanPlate exposes a prop for it.
- **Spacing (`margin`, `padding`, `gap`):** use the **suffix-only** API everywhere it applies — e.g. `margin="b-2"`, `padding="4"`, `gap="2"`. Do **not** pass CSS-class-style prefixes (`m-`, `p-`, `g-`) in prop values.
- **`Typography`:** use `align` for text alignment, `isBold` for bold, `margin` for spacing — not equivalent inline styles unless there is no prop.

Correct vs avoid:

```jsx
<Typography variant="h4" align="center" margin="b-2">Login</Typography>
```

```jsx
<Typography variant="h4" style={{ textAlign: "center", marginBottom: "1rem" }}>Login</Typography>
```

## Workflow

1. Read `node_modules/cleanplate/llms.txt` for global rules and the right `docs/*.md` path.  
2. Open the matching `docs/<Component>.md` before inventing props or patterns.  
3. Match **TypeScript types** exported from `'cleanplate'` when the project uses TypeScript.
