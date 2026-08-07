# Text comparer Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or executing-plans task-by-task. Checkboxes track progress.

**Goal:** Deliver a ready `/tools/text-comparer` tool: paste left/right text, Compare, view side-by-side diffs with word/char highlights, Swap/Clear/Copy unified diff — all on-device.

**Architecture:** Pure `compareText` built on npm `diff` (`diffLines` + `diffWords`/`diffChars`) produces aligned `TextDiffRow[]` plus a `unifiedDiff` string. A hook owns input/result state (mirror json-comparer). The page uses CleanPlate chrome; `text-diff-view.tsx` renders the highlighted panes. No ignore-whitespace/case, no live diff, no file upload in v1.

**Tech Stack:** React 19, CleanPlate, React Router 7, Vitest, `diff` (+ `@types/diff` if needed).

**Global constraints:**
- Client-side only; kebab-case filenames; CleanPlate props over inline styles (`app/AGENTS.md`)
- Follow `app/src/features/json-comparer/` patterns
- `MAX_TEXT_LENGTH = 200_000` per side
- Do not port `design/text-comparer.html` CSS into the app

## Implementation tasks

- [ ] Write design/plan docs; add `diff` dependency
- [ ] TDD pure `compare-text.ts` (line + word spans, limits, unifiedDiff)
- [ ] Implement `use-text-comparer` (compare/swap/clear/copy)
- [ ] `TextComparerPage` + `TextDiffView` + `app.css` `.text-*` styles
- [ ] Route, `tools.ts` ready, `tools.test.ts`
- [ ] Page tests + `npm test` / typecheck / lint

## Out of scope (v1)

Ignore whitespace/case toggles; live-as-you-type diff; file upload; porting design/ CSS; advanced synced scroll beyond independent `overflow: auto` panes.
