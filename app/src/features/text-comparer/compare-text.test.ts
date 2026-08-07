import { describe, expect, it } from "vitest";
import { MAX_TEXT_LENGTH, compareText } from "./compare-text";

describe("compareText", () => {
  it("marks identical texts as identical with equal rows", () => {
    const result = compareText("hello\nworld", "hello\nworld");
    expect(result.identical).toBe(true);
    expect(result.rows.every((row) => row.kind === "equal")).toBe(true);
    expect(result.rows).toHaveLength(2);
  });

  it("reports added and removed lines with spacer line numbers", () => {
    const result = compareText("a\nb", "a\nc\nb");
    expect(result.identical).toBe(false);
    const added = result.rows.find((row) => row.kind === "added");
    expect(added).toMatchObject({
      kind: "added",
      leftNumber: null,
      rightSpans: [{ text: "c" }],
    });
    expect(typeof added?.rightNumber).toBe("number");
  });

  it("reports changed lines with word-level highlights", () => {
    const result = compareText("Hello world", "Hello DevToolkit");
    expect(result.identical).toBe(false);
    const changed = result.rows.find((row) => row.kind === "changed");
    expect(changed).toBeDefined();
    expect(changed?.leftSpans.some((s) => s.highlight === "removed")).toBe(true);
    expect(changed?.rightSpans.some((s) => s.highlight === "added")).toBe(true);
    expect(changed?.leftSpans.some((s) => s.text === "Hello " && !s.highlight)).toBe(
      true
    );
  });

  it("uses character-level highlights for short token changes", () => {
    const result = compareText("cat", "bat");
    const changed = result.rows.find((row) => row.kind === "changed");
    expect(changed).toBeDefined();
    expect(changed?.leftSpans.some((s) => s.highlight === "removed")).toBe(true);
    expect(changed?.rightSpans.some((s) => s.highlight === "added")).toBe(true);
  });

  it("rejects input over the size limit", () => {
    const huge = "a".repeat(MAX_TEXT_LENGTH + 1);
    expect(() => compareText(huge, "ok")).toThrow(/Left text is too large/);
    expect(() => compareText("ok", huge)).toThrow(/Right text is too large/);
  });

  it("produces a unifiedDiff when texts differ", () => {
    const result = compareText("a\nb", "a\nc");
    expect(result.unifiedDiff).toContain("--- Left");
    expect(result.unifiedDiff).toContain("+++ Right");
    expect(result.unifiedDiff).toMatch(/^-b/m);
    expect(result.unifiedDiff).toMatch(/^\+c/m);
  });
});
