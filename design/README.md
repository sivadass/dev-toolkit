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
