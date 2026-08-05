import { describe, expect, it } from "vitest";
import {
  MAX_JSON_LENGTH,
  compareJson,
  formatDiffsAsText,
  formatJson,
} from "./compare-json";

describe("compareJson", () => {
  it("treats objects with different key order as equal", () => {
    const result = compareJson(
      '{"a":1,"b":2}',
      '{"b":2,"a":1}'
    );
    expect(result.diffs).toEqual([]);
    expect(result.summary).toEqual({ added: 0, removed: 0, changed: 0 });
  });

  it("returns empty diffs for identical values", () => {
    const result = compareJson('{"hello":"world"}', '{"hello":"world"}');
    expect(result.diffs).toHaveLength(0);
  });

  it("reports added, removed, and changed paths", () => {
    const result = compareJson(
      '{"a":1,"b":2,"c":3}',
      '{"a":1,"b":9,"d":4}'
    );
    expect(result.diffs).toEqual(
      expect.arrayContaining([
        { path: "b", type: "changed", left: 2, right: 9 },
        { path: "c", type: "removed", left: 3 },
        { path: "d", type: "added", right: 4 },
      ])
    );
    expect(result.summary).toEqual({ added: 1, removed: 1, changed: 1 });
  });

  it("reports nested paths", () => {
    const result = compareJson(
      '{"user":{"name":"Ada"}}',
      '{"user":{"name":"Grace"}}'
    );
    expect(result.diffs).toEqual([
      { path: "user.name", type: "changed", left: "Ada", right: "Grace" },
    ]);
  });

  it("compares arrays by index", () => {
    const result = compareJson("[1,2,3]", "[1,9]");
    expect(result.diffs).toEqual(
      expect.arrayContaining([
        { path: "[1]", type: "changed", left: 2, right: 9 },
        { path: "[2]", type: "removed", left: 3 },
      ])
    );
  });

  it("reports type mismatches as changed", () => {
    const result = compareJson('{"x":1}', '{"x":"1"}');
    expect(result.diffs).toEqual([
      { path: "x", type: "changed", left: 1, right: "1" },
    ]);
  });

  it("reports a single entry when an object subtree is added or removed", () => {
    const result = compareJson("{}", '{"nested":{"a":1,"b":2}}');
    expect(result.diffs).toEqual([
      { path: "nested", type: "added", right: { a: 1, b: 2 } },
    ]);
  });

  it("uses (root) for root-level scalar changes", () => {
    const result = compareJson('"a"', '"b"');
    expect(result.diffs).toEqual([
      { path: "(root)", type: "changed", left: "a", right: "b" },
    ]);
  });

  it("rejects empty input", () => {
    expect(() => compareJson("  ", "{}")).toThrow(/Left JSON is empty/);
    expect(() => compareJson("{}", "  ")).toThrow(/Right JSON is empty/);
  });

  it("rejects invalid JSON with side-named errors", () => {
    expect(() => compareJson("{bad", "{}")).toThrow(/Left JSON is invalid/);
    expect(() => compareJson("{}", "{bad")).toThrow(/Right JSON is invalid/);
  });

  it("rejects input over the size limit", () => {
    const huge = `"${"a".repeat(MAX_JSON_LENGTH)}"`;
    expect(() => compareJson(huge, "{}")).toThrow(/Left JSON is too large/);
    expect(() => compareJson("{}", huge)).toThrow(/Right JSON is too large/);
  });
});

describe("formatJson", () => {
  it("pretty-prints valid JSON", () => {
    expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}');
  });

  it("throws on invalid JSON", () => {
    expect(() => formatJson("{bad")).toThrow(/invalid/i);
  });

  it("rejects empty input", () => {
    expect(() => formatJson("  ")).toThrow(/empty/i);
  });
});

describe("formatDiffsAsText", () => {
  it("formats identical results", () => {
    const text = formatDiffsAsText({
      diffs: [],
      summary: { added: 0, removed: 0, changed: 0 },
    });
    expect(text).toMatch(/No differences/i);
  });

  it("formats diff entries", () => {
    const text = formatDiffsAsText({
      diffs: [
        { path: "b", type: "changed", left: 2, right: 9 },
        { path: "c", type: "removed", left: 3 },
        { path: "d", type: "added", right: 4 },
      ],
      summary: { added: 1, removed: 1, changed: 1 },
    });
    expect(text).toContain("added: 1, removed: 1, changed: 1");
    expect(text).toContain("CHANGED b: 2 → 9");
    expect(text).toContain("REMOVED c: 3");
    expect(text).toContain("ADDED d: 4");
  });
});
