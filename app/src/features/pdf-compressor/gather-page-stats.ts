import type { PDFPageProxy } from "pdfjs-dist";
import type { PageStats } from "./classify-pdf";

/** Subset of pdf.js OPS (stable numeric ids) — avoid importing pdfjs in unit tests. */
export const PDF_OPS = {
  save: 10,
  restore: 11,
  transform: 12,
  paintImageMaskXObject: 83,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87,
  paintImageXObjectRepeat: 88,
} as const;

function multiplyCtm(a: number[], b: number[]): number[] {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

/** Estimate fraction of page area covered by painted images via CTM tracking. */
export function estimateImageAreaRatio(
  fnArray: number[],
  argsArray: unknown[],
  pageWidth: number,
  pageHeight: number
): number {
  const pageArea = pageWidth * pageHeight;
  if (pageArea <= 0) return 0;

  let ctm = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];
  let covered = 0;

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    const args = argsArray[i] as number[] | undefined;
    switch (fn) {
      case PDF_OPS.save:
        stack.push(ctm.slice());
        break;
      case PDF_OPS.restore:
        ctm = stack.pop() ?? ctm;
        break;
      case PDF_OPS.transform:
        if (args && args.length >= 6) {
          ctm = multiplyCtm(ctm, args);
        }
        break;
      case PDF_OPS.paintImageXObject:
      case PDF_OPS.paintInlineImageXObject:
      case PDF_OPS.paintImageMaskXObject:
      case PDF_OPS.paintImageXObjectRepeat:
      case PDF_OPS.paintInlineImageXObjectGroup: {
        const w = Math.hypot(ctm[0], ctm[1]);
        const h = Math.hypot(ctm[2], ctm[3]);
        covered += w * h;
        break;
      }
      default:
        break;
    }
  }

  return Math.min(1, covered / pageArea);
}

export async function gatherPageStats(page: PDFPageProxy): Promise<PageStats> {
  const viewport = page.getViewport({ scale: 1 });
  const [textContent, opList] = await Promise.all([
    page.getTextContent(),
    page.getOperatorList(),
  ]);

  const textItemCount = textContent.items.filter(
    (item) => "str" in item && Boolean((item as { str: string }).str.trim())
  ).length;

  const imageAreaRatio = estimateImageAreaRatio(
    opList.fnArray,
    opList.argsArray,
    viewport.width,
    viewport.height
  );

  return { imageAreaRatio, textItemCount };
}
