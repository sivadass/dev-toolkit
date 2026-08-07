import { describe, expect, it, vi } from "vitest";

const save = vi.fn(async () => new Uint8Array([1, 2, 3]));
const setTitle = vi.fn();
const setAuthor = vi.fn();
const setSubject = vi.fn();
const setKeywords = vi.fn();
const setProducer = vi.fn();
const setCreator = vi.fn();

vi.mock("pdf-lib", () => ({
  PDFDocument: {
    load: vi.fn(async () => ({
      setTitle,
      setAuthor,
      setSubject,
      setKeywords,
      setProducer,
      setCreator,
      save,
    })),
  },
}));

describe("optimizePdf", () => {
  it("strips metadata and saves with object streams", async () => {
    const { optimizePdf } = await import("./pipeline-optimize");
    const input = new Uint8Array([9, 9, 9]);
    const out = await optimizePdf(input);

    expect(setTitle).toHaveBeenCalledWith("");
    expect(setAuthor).toHaveBeenCalledWith("");
    expect(setSubject).toHaveBeenCalledWith("");
    expect(setKeywords).toHaveBeenCalledWith([]);
    expect(setProducer).toHaveBeenCalledWith("");
    expect(setCreator).toHaveBeenCalledWith("");
    expect(save).toHaveBeenCalledWith({ useObjectStreams: true });
    expect(out).toEqual(new Uint8Array([1, 2, 3]));
  });
});
