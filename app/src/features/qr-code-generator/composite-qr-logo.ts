export const LOGO_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
] as const;

/** Logo max side as a fraction of QR size (spec: ~18–22%). */
export const LOGO_SIZE_RATIO = 0.2;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not load logo image."));
      }
    };
    reader.onerror = () => reject(new Error("Could not load logo image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load logo image."));
    image.src = src;
  });
}

function fitLogoSize(
  naturalWidth: number,
  naturalHeight: number,
  maxSide: number
): { width: number; height: number } {
  const scale = Math.min(
    maxSide / Math.max(naturalWidth, 1),
    maxSide / Math.max(naturalHeight, 1),
    1
  );
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
  };
}

async function compositePng(
  pngDataUrl: string,
  logo: HTMLImageElement,
  size: number
): Promise<string> {
  const qrImage = await loadImage(pngDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not load logo image.");
  }

  ctx.drawImage(qrImage, 0, 0, size, size);

  const maxSide = Math.round(size * LOGO_SIZE_RATIO);
  const { width, height } = fitLogoSize(
    logo.naturalWidth || logo.width,
    logo.naturalHeight || logo.height,
    maxSide
  );
  const pad = Math.round(Math.max(width, height) * 0.18);
  const boxWidth = width + pad * 2;
  const boxHeight = height + pad * 2;
  const boxX = Math.round((size - boxWidth) / 2);
  const boxY = Math.round((size - boxHeight) / 2);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctx.drawImage(logo, boxX + pad, boxY + pad, width, height);

  return canvas.toDataURL("image/png");
}

function compositeSvg(
  svgString: string,
  logoDataUrl: string,
  logo: HTMLImageElement,
  size: number
): string {
  const maxSide = Math.round(size * LOGO_SIZE_RATIO);
  const { width, height } = fitLogoSize(
    logo.naturalWidth || logo.width,
    logo.naturalHeight || logo.height,
    maxSide
  );
  const pad = Math.round(Math.max(width, height) * 0.18);
  const boxWidth = width + pad * 2;
  const boxHeight = height + pad * 2;
  const boxX = Math.round((size - boxWidth) / 2);
  const boxY = Math.round((size - boxHeight) / 2);

  const overlay = [
    `<rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" fill="#ffffff"/>`,
    `<image href="${logoDataUrl}" x="${boxX + pad}" y="${boxY + pad}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`,
  ].join("");

  if (svgString.includes("</svg>")) {
    return svgString.replace("</svg>", `${overlay}</svg>`);
  }

  return `${svgString}${overlay}`;
}

export async function compositeQrLogo(
  pngDataUrl: string,
  svgString: string,
  logoFile: File,
  size: number
): Promise<{ pngDataUrl: string; svgString: string }> {
  const logoDataUrl = await readFileAsDataUrl(logoFile);
  const logo = await loadImage(logoDataUrl);
  const nextPng = await compositePng(pngDataUrl, logo, size);
  const nextSvg = compositeSvg(svgString, logoDataUrl, logo, size);

  return { pngDataUrl: nextPng, svgString: nextSvg };
}
