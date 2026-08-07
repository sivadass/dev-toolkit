# Text Comparer — Design Spec

**Date:** 2026-08-07  
**Status:** Approved for implementation  
**Scope:** New client-side tool to compare two text blocks with side-by-side highlighting.

## Goal

Add a **Text comparer** tool so users can paste left and right text, press Compare, and inspect differences in a side-by-side view with line and word/character highlighting. All work stays in the browser.

## Product decisions

| Decision | Choice |
|----------|--------|
| Diff UI | Side-by-side highlighted panes |
| Granularity | Line + word/char within changed lines |
| Trigger | Compare button (editing inputs clears the result) |
| Actions | Compare, Swap, Clear, Copy unified diff |
| Engine | `diff` library + custom React rendering |
| Size limit | 200,000 characters per side |

## Out of scope (v1)

- Ignore whitespace / ignore case toggles
- Live-as-you-type diff
- File upload / download
- Porting `design/` CSS into the app
- Advanced synced scroll beyond independent `overflow: auto` panes

## UX

1. **PageHeader** — “Text comparer” / “Compare two text blocks — stays on-device.” Primary CTA: Compare (disabled until both sides have content).
2. **Input stage** — Left / Right CleanPlate textareas in a split grid; Swap and Clear below.
3. **On Compare** — Diff panel with two read-only highlighted columns, line numbers, added/removed row backgrounds, word/char spans inside changed lines. Spacer rows keep sides aligned.
4. **After compare** — Copy unified diff with brief “Copied” feedback. Editing either textarea clears the Diff panel.
5. **Identical** — “No differences — the texts are equal.”
6. **Errors** — Alert when a side exceeds the size limit; clipboard failure message on copy errors.

## Architecture

```
left/right text (hook state)
  → compare() → compareText(left, right)
  → CompareTextResult { rows, identical, unifiedDiff }
  → TextDiffView renders rows; Copy uses unifiedDiff
```

### Module layout

```
app/src/features/text-comparer/
  compare-text.ts
  compare-text.test.ts
  use-text-comparer.ts
  text-diff-view.tsx
  text-comparer-page.tsx
  text-comparer-page.test.tsx
```

### Data model

- `TextSpan` — text + optional highlight (`added` | `removed`)
- `TextDiffRow` — kind, left/right line numbers (null = spacer), left/right spans
- `CompareTextResult` — rows, identical flag, unifiedDiff string

### Algorithm

1. Line-level diff for row alignment (`diffLines`)
2. For changed line pairs, word-level diff (`diffWords`), with character fallback for short tokens (`diffChars`)
3. Build `TextDiffRow[]` with spacers for pure add/remove
4. Generate unified diff string for Copy

## Wire-up

- Explicit route `/tools/text-comparer` above `:toolId`
- Registry entry flipped from `coming-soon` to `ready`
- Feature CSS under `.text-*` in `app.css`
