import { describe, expect, it } from "vitest";
import { encodeBase64 } from "./encode-base64";

describe("encodeBase64", () => {
  it("encodes ASCII to standard Base64", () => {
    expect(encodeBase64("hello")).toBe("aGVsbG8=");
  });

  it("encodes Unicode as UTF-8", () => {
    expect(encodeBase64("你好")).toBe("5L2g5aW9");
  });

  it("encodes URL-safe when requested", () => {
    const standard = encodeBase64("\u00ff\u00ef");
    const urlSafe = encodeBase64("\u00ff\u00ef", { urlSafe: true });
    expect(urlSafe).not.toMatch(/[+/=]/);
    expect(urlSafe.replace(/-/g, "+").replace(/_/g, "/")).toBe(
      standard.replace(/=+$/, "")
    );
  });
});
