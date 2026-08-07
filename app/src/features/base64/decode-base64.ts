export function decodeBase64(input: string): string {
  try {
    let normalized = input.replace(/\s+/g, "");
    normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4;
    if (pad === 1) {
      throw new Error("Invalid Base64 input.");
    }
    if (pad > 0) {
      normalized += "=".repeat(4 - pad);
    }
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid Base64 input.") {
      throw err;
    }
    throw new Error("Invalid Base64 input.");
  }
}
