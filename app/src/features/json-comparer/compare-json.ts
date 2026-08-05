export type DiffType = "added" | "removed" | "changed";

export interface JsonDiffEntry {
  path: string;
  type: DiffType;
  left?: unknown;
  right?: unknown;
}

export interface CompareJsonResult {
  diffs: JsonDiffEntry[];
  summary: { added: number; removed: number; changed: number };
}

export const MAX_JSON_LENGTH = 200_000;

type Side = "Left" | "Right";

function displayPath(path: string): string {
  return path === "" ? "(root)" : path;
}

function joinPath(parent: string, key: string | number): string {
  if (typeof key === "number") {
    return `${parent}[${key}]`;
  }
  return parent === "" ? key : `${parent}.${key}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSide(text: string, side: Side): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(`${side} JSON is empty.`);
  }
  if (trimmed.length > MAX_JSON_LENGTH) {
    throw new Error(
      `${side} JSON is too large. Keep each side under ${MAX_JSON_LENGTH.toLocaleString()} characters.`
    );
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unexpected token";
    throw new Error(`${side} JSON is invalid: ${detail}`);
  }
}

function walk(left: unknown, right: unknown, path: string, diffs: JsonDiffEntry[]) {
  if (Object.is(left, right)) {
    return;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length);
    for (let i = 0; i < max; i += 1) {
      const childPath = joinPath(path, i);
      if (i >= left.length) {
        diffs.push({ path: displayPath(childPath), type: "added", right: right[i] });
      } else if (i >= right.length) {
        diffs.push({ path: displayPath(childPath), type: "removed", left: left[i] });
      } else {
        walk(left[i], right[i], childPath, diffs);
      }
    }
    return;
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of keys) {
      const childPath = joinPath(path, key);
      const hasLeft = Object.prototype.hasOwnProperty.call(left, key);
      const hasRight = Object.prototype.hasOwnProperty.call(right, key);
      if (!hasLeft) {
        diffs.push({ path: displayPath(childPath), type: "added", right: right[key] });
      } else if (!hasRight) {
        diffs.push({ path: displayPath(childPath), type: "removed", left: left[key] });
      } else {
        walk(left[key], right[key], childPath, diffs);
      }
    }
    return;
  }

  diffs.push({
    path: displayPath(path),
    type: "changed",
    left,
    right,
  });
}

function buildSummary(diffs: JsonDiffEntry[]): CompareJsonResult["summary"] {
  const summary = { added: 0, removed: 0, changed: 0 };
  for (const diff of diffs) {
    summary[diff.type] += 1;
  }
  return summary;
}

export function compareJson(leftText: string, rightText: string): CompareJsonResult {
  const left = parseSide(leftText, "Left");
  const right = parseSide(rightText, "Right");
  const diffs: JsonDiffEntry[] = [];
  walk(left, right, "", diffs);
  return { diffs, summary: buildSummary(diffs) };
}

export function formatJson(text: string, side: Side = "Left"): string {
  const value = parseSide(text, side);
  return JSON.stringify(value, null, 2);
}

function stringifyValue(value: unknown): string {
  return JSON.stringify(value);
}

export function formatDiffsAsText(result: CompareJsonResult): string {
  if (result.diffs.length === 0) {
    return "No differences — the JSON values are equal.";
  }

  const { added, removed, changed } = result.summary;
  const lines = [
    `Summary: added: ${added}, removed: ${removed}, changed: ${changed}`,
    "",
  ];

  for (const diff of result.diffs) {
    if (diff.type === "added") {
      lines.push(`ADDED ${diff.path}: ${stringifyValue(diff.right)}`);
    } else if (diff.type === "removed") {
      lines.push(`REMOVED ${diff.path}: ${stringifyValue(diff.left)}`);
    } else {
      lines.push(
        `CHANGED ${diff.path}: ${stringifyValue(diff.left)} → ${stringifyValue(diff.right)}`
      );
    }
  }

  return lines.join("\n");
}
