export const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_INPUT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export type OutputMimeType = "image/webp" | "image/jpeg" | "image/png";

export interface CompressImageOptions {
  quality: number;
  maxDimension: number;
  outputType: OutputMimeType;
}

export interface CompressImageResult {
  blob: Blob;
  width: number;
  height: number;
  mimeType: OutputMimeType;
}

export function computeTargetSize(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (!maxDimension || maxDimension <= 0) {
    return { width, height };
  }
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_INPUT_BYTES) {
    return "Image must be 10 MB or smaller.";
  }
  if (
    !ACCEPTED_INPUT_TYPES.includes(
      file.type as (typeof ACCEPTED_INPUT_TYPES)[number]
    )
  ) {
    return "Unsupported file type. Use PNG, JPEG, WebP, or GIF.";
  }
  return null;
}

export function buildDownloadName(
  originalName: string,
  mimeType: OutputMimeType
): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  const ext =
    mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : "webp";
  return `${base}.compressed.${ext}`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: OutputMimeType,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const quality01 = type === "image/png" ? undefined : quality / 100;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not encode image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality01
    );
  });
}

export async function compressImage(
  file: File,
  options: CompressImageOptions
): Promise<CompressImageResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Could not read this image.");
  }

  try {
    const target = computeTargetSize(
      bitmap.width,
      bitmap.height,
      options.maxDimension
    );
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not available in this browser.");
    }
    ctx.drawImage(bitmap, 0, 0, target.width, target.height);
    const blob = await canvasToBlob(canvas, options.outputType, options.quality);
    return {
      blob,
      width: target.width,
      height: target.height,
      mimeType: options.outputType,
    };
  } finally {
    bitmap.close();
  }
}
