import { describe, expect, it } from "vitest";
import { TOOLS, getToolById, getToolMenuItems } from "./tools";

describe("tools registry", () => {
  it("lists six tools with image compressor, QR tools, and JSON comparer ready", () => {
    expect(TOOLS).toHaveLength(6);
    expect(getToolById("image-compressor")?.status).toBe("ready");
    expect(getToolById("qr-code-generator")?.status).toBe("ready");
    expect(getToolById("qr-decoder")?.status).toBe("ready");
    expect(getToolById("json-comparer")?.status).toBe("ready");
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
