import QRCode from "qrcode";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface GenerateQrOptions {
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  foreground: string;
  background: string;
}

export interface GenerateQrResult {
  pngDataUrl: string;
  svgString: string;
  size: number;
  downloadNamePng: string;
  downloadNameSvg: string;
}

export const MAX_CONTENT_LENGTH = 2000;
export const MIN_SIZE = 128;
export const MAX_SIZE = 1024;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (HEX_COLOR.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

export function validateQrInput(
  content: string,
  options: GenerateQrOptions
): string | null {
  const text = content.trim();
  if (!text) {
    return "Enter content to encode.";
  }
  if (text.length > MAX_CONTENT_LENGTH) {
    return `Content must be ${MAX_CONTENT_LENGTH} characters or fewer.`;
  }
  if (
    !Number.isFinite(options.size) ||
    options.size < MIN_SIZE ||
    options.size > MAX_SIZE
  ) {
    return `Size must be between ${MIN_SIZE} and ${MAX_SIZE} pixels.`;
  }
  const foreground = normalizeHexColor(options.foreground);
  const background = normalizeHexColor(options.background);
  if (!HEX_COLOR.test(foreground)) {
    return "Foreground must be a hex color like #000000.";
  }
  if (!HEX_COLOR.test(background)) {
    return "Background must be a hex color like #ffffff.";
  }
  if (foreground === background) {
    return "Foreground and background colors must be different.";
  }
  return null;
}

export function buildQrDownloadNames(): { png: string; svg: string } {
  return { png: "qr-code.png", svg: "qr-code.svg" };
}

export async function generateQrCode(
  content: string,
  options: GenerateQrOptions
): Promise<GenerateQrResult> {
  const validationError = validateQrInput(content, options);
  if (validationError) {
    throw new Error(validationError);
  }

  const text = content.trim();
  const foreground = normalizeHexColor(options.foreground);
  const background = normalizeHexColor(options.background);
  const qrOptions = {
    width: options.size,
    margin: 2,
    errorCorrectionLevel: options.errorCorrectionLevel,
    color: {
      dark: foreground,
      light: background,
    },
  };

  try {
    const [pngDataUrl, svgString] = await Promise.all([
      QRCode.toDataURL(text, qrOptions),
      QRCode.toString(text, { ...qrOptions, type: "svg" }),
    ]);
    const names = buildQrDownloadNames();
    return {
      pngDataUrl,
      svgString,
      size: options.size,
      downloadNamePng: names.png,
      downloadNameSvg: names.svg,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not generate QR code.";
    if (/too big|capacity|length/i.test(message)) {
      throw new Error(
        "Content is too long for the selected error correction level. Shorten it or lower the ECC level."
      );
    }
    throw new Error(message || "Could not generate QR code.");
  }
}
