import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageCompressorPage } from "./image-compressor-page";

describe("ImageCompressorPage", () => {
  it("renders quiet craft header and compress action with the file step", () => {
    const { container } = render(<ImageCompressorPage />);
    expect(screen.getByText(/client-side/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /image compressor/i })
    ).toHaveClass("tool-page-header__title");
    const compress = screen.getByRole("button", { name: /compress/i });
    expect(compress).toBeDisabled();
    expect(container.querySelector(".tool-primary-step")).toContainElement(compress);
    expect(container.querySelector(".tool-page-header__cta")).toBeNull();
  });
});
