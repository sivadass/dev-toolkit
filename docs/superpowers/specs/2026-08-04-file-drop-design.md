# File drop control — design

Date: 2026-08-04  
Status: approved for implementation planning  
Scope: `design/` prototype (UI kit + image compressor)

## Goal

Replace the native file input with a shared, highly customized dropzone that transforms into file chip(s) after selection, with drag-and-drop and browse support.

## Decisions

| Topic | Choice |
| --- | --- |
| Interaction model | Dropzone → selected chip(s) with name, size, remove |
| Cardinality | Single on image compressor; UI kit documents both single and multi |
| Chip media | Thumbnail when `file.type` starts with `image/`; Material icon fallback otherwise |
| Interactivity | Minimal shared JS — enough to demo transform; rely on native `accept` only |
| Architecture | Shared markup + `components.css` + `file-drop.js` |

## Structure

Place the control inside an existing `.field`:

```html
<div class="field">
  <label class="field__label" for="…">…</label>
  <div class="file-drop" data-file-drop data-multiple="false|true">
    <input class="file-drop__input" id="…" type="file" accept="…" />
    <div class="file-drop__idle" data-file-drop-idle>
      <!-- icon, primary copy, “or browse” -->
    </div>
    <ul class="file-drop__list" data-file-drop-list hidden></ul>
  </div>
  <p class="field__hint">…</p>
</div>
```

### Files to touch

- `design/assets/styles/components.css` — `.file-drop*` styles using design tokens
- `design/assets/scripts/file-drop.js` — minimal behavior
- `design/ui-kit.html` — File drop section with live single + multi demos
- `design/image-compressor.html` — replace native `<input type="file">` with single image dropzone; load `file-drop.js`

## Visual

### Idle

- Dashed border, muted surface (`--color-surface-muted`), panel radius
- Centered Material Symbols icon (`upload_file`)
- Primary line: “Drop an image here” (single / compressor) or “Drop files here” (multi)
- Secondary line: “or browse”
- Hover / `:focus-within`: primary-soft fill
- Dragging (`is-dragging`): accent-soft fill + stronger border emphasis
- Entire zone is the hit target (hidden native input overlaid or label-associated)

### Selected (chips)

- Idle block hidden; list shown
- Each chip: thumbnail or icon · truncated filename · human-readable size · remove button
- Single mode: one chip; a new pick replaces the previous file
- Multi mode: chips stack; new picks append via an internal file array (so remove works despite `FileList` immutability)

## Behavior (`file-drop.js`)

1. Initialize every `[data-file-drop]`.
2. Toggle `is-dragging` with a drag-enter/leave counter (avoid flicker).
3. On drop or `change`, read files; honor `data-multiple` / `multiple` attribute.
4. Render chips; create object URLs for image thumbnails and revoke on remove/replace.
5. Remove button drops that file; when empty, restore idle UI.
6. Do **not** add custom MIME validation beyond the input’s `accept` attribute.
7. Do **not** implement compression, upload, or preview panes — those stay placeholders on the compressor page.

## Accessibility

- Visible label via `.field__label` associated with the file input `id`
- Keyboard: native file input remains focusable / activatable; focus-visible ring on the dropzone via `:focus-within`
- Remove controls are real `<button type="button">` with accessible names (e.g. “Remove {filename}”)
- Dragging state is visual only; selection still works via browse

## Out of scope

- Real image compression
- Error UI for rejected MIME types beyond browser `accept` filtering
- Dark theme / alternate skins
- Extracting the control into a framework component (prototype stays vanilla HTML/CSS/JS)

## Success criteria

- UI kit shows working single and multi dropzones with chip transform
- Image compressor uses the same single-file control with PNG/JPG `accept`
- Look and tokens match the existing DevToolkit design system
- No hard-coded brand hex values outside `tokens.css`
