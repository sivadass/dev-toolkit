import {
  createTwoFilesPatch,
  diffChars,
  diffLines,
  diffWords,
  type Change,
} from "diff";

export type TextRowKind = "equal" | "added" | "removed" | "changed";

export interface TextSpan {
  text: string;
  highlight?: "added" | "removed";
}

export interface TextDiffRow {
  kind: TextRowKind;
  leftNumber: number | null;
  rightNumber: number | null;
  leftSpans: TextSpan[];
  rightSpans: TextSpan[];
}

export interface CompareTextResult {
  rows: TextDiffRow[];
  identical: boolean;
  unifiedDiff: string;
}

export const MAX_TEXT_LENGTH = 200_000;

type Side = "Left" | "Right";

function assertSideSize(text: string, side: Side) {
  if (text.length > MAX_TEXT_LENGTH) {
    throw new Error(
      `${side} text is too large. Keep each side under ${MAX_TEXT_LENGTH.toLocaleString()} characters.`
    );
  }
}

function linesFromChangeValue(value: string): string[] {
  const parts = value.split("\n");
  if (value.endsWith("\n")) {
    parts.pop();
  }
  return parts;
}

function shouldUseCharDiff(left: string, right: string): boolean {
  const noSpaces = !/\s/.test(left) && !/\s/.test(right);
  const short =
    left.length <= 12 && right.length <= 12;
  return noSpaces && short;
}

function spansFromInlineDiff(changes: Change[]): {
  leftSpans: TextSpan[];
  rightSpans: TextSpan[];
} {
  const leftSpans: TextSpan[] = [];
  const rightSpans: TextSpan[] = [];

  for (const part of changes) {
    if (part.added) {
      rightSpans.push({ text: part.value, highlight: "added" });
    } else if (part.removed) {
      leftSpans.push({ text: part.value, highlight: "removed" });
    } else {
      leftSpans.push({ text: part.value });
      rightSpans.push({ text: part.value });
    }
  }

  return { leftSpans, rightSpans };
}

function buildInlineSpans(left: string, right: string): {
  leftSpans: TextSpan[];
  rightSpans: TextSpan[];
} {
  const changes = shouldUseCharDiff(left, right)
    ? diffChars(left, right)
    : diffWords(left, right);
  return spansFromInlineDiff(changes);
}

function plainSpans(text: string): TextSpan[] {
  return [{ text }];
}

export function compareText(leftText: string, rightText: string): CompareTextResult {
  assertSideSize(leftText, "Left");
  assertSideSize(rightText, "Right");

  const identical = leftText === rightText;
  const unifiedDiff = createTwoFilesPatch("Left", "Right", leftText, rightText);
  const changes = diffLines(leftText, rightText);

  const rows: TextDiffRow[] = [];
  let leftNumber = 1;
  let rightNumber = 1;
  let index = 0;

  while (index < changes.length) {
    const change = changes[index];
    const isEqual = !change.added && !change.removed;

    if (isEqual) {
      for (const line of linesFromChangeValue(change.value)) {
        rows.push({
          kind: "equal",
          leftNumber: leftNumber++,
          rightNumber: rightNumber++,
          leftSpans: plainSpans(line),
          rightSpans: plainSpans(line),
        });
      }
      index += 1;
      continue;
    }

    const next = changes[index + 1];
    if (change.removed && next?.added) {
      const leftLines = linesFromChangeValue(change.value);
      const rightLines = linesFromChangeValue(next.value);
      const max = Math.max(leftLines.length, rightLines.length);

      for (let i = 0; i < max; i += 1) {
        const hasLeft = i < leftLines.length;
        const hasRight = i < rightLines.length;

        if (hasLeft && hasRight) {
          const { leftSpans, rightSpans } = buildInlineSpans(
            leftLines[i],
            rightLines[i]
          );
          rows.push({
            kind: "changed",
            leftNumber: leftNumber++,
            rightNumber: rightNumber++,
            leftSpans,
            rightSpans,
          });
        } else if (hasLeft) {
          rows.push({
            kind: "removed",
            leftNumber: leftNumber++,
            rightNumber: null,
            leftSpans: plainSpans(leftLines[i]),
            rightSpans: [],
          });
        } else {
          rows.push({
            kind: "added",
            leftNumber: null,
            rightNumber: rightNumber++,
            leftSpans: [],
            rightSpans: plainSpans(rightLines[i]),
          });
        }
      }

      index += 2;
      continue;
    }

    if (change.removed) {
      for (const line of linesFromChangeValue(change.value)) {
        rows.push({
          kind: "removed",
          leftNumber: leftNumber++,
          rightNumber: null,
          leftSpans: plainSpans(line),
          rightSpans: [],
        });
      }
      index += 1;
      continue;
    }

    if (change.added) {
      for (const line of linesFromChangeValue(change.value)) {
        rows.push({
          kind: "added",
          leftNumber: null,
          rightNumber: rightNumber++,
          leftSpans: [],
          rightSpans: plainSpans(line),
        });
      }
      index += 1;
    }
  }

  return { rows, identical, unifiedDiff };
}
