import { describe, expect, it } from "vitest";
import { decodeBase64 } from "./decode-base64";
import { encodeBase64 } from "./encode-base64";

describe("decodeBase64", () => {
  it("decodes standard Base64", () => {
    expect(decodeBase64("aGVsbG8=")).toBe("hello");
  });

  it("decodes URL-safe Base64", () => {
    const urlSafe = encodeBase64("\u00ff\u00ef", { urlSafe: true });
    expect(decodeBase64(urlSafe)).toBe("\u00ff\u00ef");
  });

  it("ignores whitespace in input", () => {
    expect(decodeBase64("aGVs\nbG8=\n")).toBe("hello");
  });

  it("round-trips Unicode via encodeBase64", () => {
    const encoded = encodeBase64("你好");
    expect(decodeBase64(encoded)).toBe("你好");
  });

  it("throws on invalid Base64 input", () => {
    expect(() => decodeBase64("!!!not-base64!!!")).toThrow(
      "Invalid Base64 input."
    );
  });
});
