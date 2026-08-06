import jsQR from "jsqr";

export const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_INPUT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

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

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    image.src = url;
  });
}

export async function decodeQrFromFile(file: File): Promise<string> {
  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not read image pixels.");
  }

  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (!code) {
    throw new Error("No QR code found in this image.");
  }

  return code.data;
}
