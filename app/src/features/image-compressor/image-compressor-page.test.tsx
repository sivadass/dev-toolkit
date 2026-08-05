import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageCompressorPage } from "./image-compressor-page";

describe("ImageCompressorPage", () => {
  it("renders title, file control, and compress action", () => {
    render(<ImageCompressorPage />);
    expect(screen.getByText("Image compressor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compress/i })).toBeDisabled();
  });
});
