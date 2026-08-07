import type { CompressMode, PdfClassification, QualityPresetId } from "./compress-pdf";

export type WorkerInMessage =
  | {
      type: "inspect";
      requestId: number;
      bytes: Uint8Array;
    }
  | {
      type: "compress";
      requestId: number;
      bytes: Uint8Array;
      mode: CompressMode;
      presetId: QualityPresetId;
    }
  | { type: "cancel"; requestId: number };

export type WorkerOutMessage =
  | {
      type: "inspected";
      requestId: number;
      pageCount: number;
      classification: PdfClassification;
    }
  | {
      type: "classified";
      requestId: number;
      classification: PdfClassification;
      pageCount: number;
    }
  | {
      type: "progress";
      requestId: number;
      current: number;
      total: number;
    }
  | {
      type: "done";
      requestId: number;
      bytes: Uint8Array;
      originalBytes: number;
      pageCount: number;
    }
  | { type: "error"; requestId: number; message: string };
