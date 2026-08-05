import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QrCodeGeneratorPage } from "./qr-code-generator-page";

describe("QrCodeGeneratorPage", () => {
  it("renders title and disables Generate when content is empty", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByText("QR Code generator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
  });
});
