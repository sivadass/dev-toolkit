import { PDFDocument } from "pdf-lib";

/** Strip common metadata fields and re-save with object streams. */
export async function optimizePdf(bytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  stripMetadata(pdfDoc);
  return pdfDoc.save({ useObjectStreams: true });
}

export function stripMetadata(pdfDoc: PDFDocument): void {
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");
}
