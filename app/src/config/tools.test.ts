import { describe, expect, it } from "vitest";
import { TOOLS, getToolById, getToolMenuItems } from "./tools";

describe("tools registry", () => {
  it("lists eight tools with image compressor, PDF compressor, QR tools, JSON tools, and text comparer ready", () => {
    expect(TOOLS).toHaveLength(8);
    expect(getToolById("image-compressor")?.status).toBe("ready");
    expect(getToolById("pdf-compressor")?.status).toBe("ready");
    expect(getToolById("qr-code-generator")?.status).toBe("ready");
    expect(getToolById("qr-decoder")?.status).toBe("ready");
    expect(getToolById("json-comparer")?.status).toBe("ready");
    expect(getToolById("json-visualiser")?.status).toBe("ready");
    expect(getToolById("text-comparer")?.status).toBe("ready");
  });

  it("returns menu items with path values", () => {
    const items = getToolMenuItems();
    expect(items[0]).toEqual({
      label: "Image compressor",
      value: "/tools/image-compressor",
      icon: "image",
    });
  });

  it("returns undefined for unknown ids", () => {
    expect(getToolById("nope")).toBeUndefined();
  });
});
