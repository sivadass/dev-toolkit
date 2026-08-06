import { describe, expect, it } from "vitest";
import { TOOLS, getToolById, getToolMenuItems } from "./tools";

describe("tools registry", () => {
  it("lists seven tools with image compressor, QR tools, JSON comparer, and JSON visualiser ready", () => {
    expect(TOOLS).toHaveLength(7);
    expect(getToolById("image-compressor")?.status).toBe("ready");
    expect(getToolById("qr-code-generator")?.status).toBe("ready");
    expect(getToolById("qr-decoder")?.status).toBe("ready");
    expect(getToolById("json-comparer")?.status).toBe("ready");
    expect(getToolById("json-visualiser")?.status).toBe("ready");
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
