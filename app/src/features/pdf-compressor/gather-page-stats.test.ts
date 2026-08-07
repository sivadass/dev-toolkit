import { describe, expect, it } from "vitest";
import { PDF_OPS, estimateImageAreaRatio } from "./gather-page-stats";

describe("estimateImageAreaRatio", () => {
  it("returns 0 when there are no image paints", () => {
    expect(estimateImageAreaRatio([], [], 100, 100)).toBe(0);
  });

  it("estimates coverage from CTM-scaled unit image square", () => {
    // transform scales unit square to 80x100 on a 100x100 page → ratio 0.8
    const fnArray = [PDF_OPS.transform, PDF_OPS.paintImageXObject];
    const argsArray = [[80, 0, 0, 100, 0, 0], ["img1"]];
    expect(estimateImageAreaRatio(fnArray, argsArray, 100, 100)).toBeCloseTo(
      0.8,
      5
    );
  });
});
