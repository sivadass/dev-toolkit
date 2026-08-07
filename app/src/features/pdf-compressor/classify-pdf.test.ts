import { describe, expect, it } from "vitest";
import {
  classifyDocument,
  classifyPage,
  type PageStats,
} from "./classify-pdf";

describe("classifyPage", () => {
  it("labels scanned pages with high image ratio and little text", () => {
    expect(
      classifyPage({ imageAreaRatio: 0.95, textItemCount: 0 })
    ).toBe("scanned");
    expect(
      classifyPage({ imageAreaRatio: 0.8, textItemCount: 5 })
    ).toBe("scanned");
  });

  it("labels text pages with low image ratio and many text items", () => {
    expect(
      classifyPage({ imageAreaRatio: 0.05, textItemCount: 100 })
    ).toBe("text");
    expect(
      classifyPage({ imageAreaRatio: 0.19, textItemCount: 21 })
    ).toBe("text");
  });

  it("labels ambiguous pages as mixed", () => {
    expect(
      classifyPage({ imageAreaRatio: 0.5, textItemCount: 50 })
    ).toBe("mixed");
    expect(
      classifyPage({ imageAreaRatio: 0.9, textItemCount: 40 })
    ).toBe("mixed");
  });
});

describe("classifyDocument", () => {
  it("returns scanned when every page is scanned", () => {
    const pages: PageStats[] = [
      { imageAreaRatio: 0.9, textItemCount: 0 },
      { imageAreaRatio: 0.85, textItemCount: 2 },
    ];
    expect(classifyDocument(pages)).toEqual({
      classification: "scanned",
      pageLabels: ["scanned", "scanned"],
    });
  });

  it("returns text when every page is text", () => {
    const pages: PageStats[] = [
      { imageAreaRatio: 0.1, textItemCount: 80 },
      { imageAreaRatio: 0.0, textItemCount: 40 },
    ];
    expect(classifyDocument(pages)).toEqual({
      classification: "text",
      pageLabels: ["text", "text"],
    });
  });

  it("returns mixed when pages differ or any page is mixed", () => {
    expect(
      classifyDocument([
        { imageAreaRatio: 0.9, textItemCount: 0 },
        { imageAreaRatio: 0.1, textItemCount: 80 },
      ])
    ).toEqual({
      classification: "mixed",
      pageLabels: ["scanned", "text"],
    });

    expect(
      classifyDocument([{ imageAreaRatio: 0.5, textItemCount: 10 }])
    ).toEqual({
      classification: "mixed",
      pageLabels: ["mixed"],
    });
  });

  it("returns mixed for empty page list", () => {
    expect(classifyDocument([])).toEqual({
      classification: "mixed",
      pageLabels: [],
    });
  });
});
