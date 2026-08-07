export interface EncodeBase64Options {
  urlSafe?: boolean;
}

export function encodeBase64(
  text: string,
  options: EncodeBase64Options = {}
): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  let encoded = btoa(binary);
  if (options.urlSafe) {
    encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return encoded;
}
