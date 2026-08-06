import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QrCodeGeneratorPage } from "./qr-code-generator-page";

describe("QrCodeGeneratorPage", () => {
  it("renders title and disables Generate when content is empty", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByText("QR Code generator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate/i })).toBeDisabled();
  });

  it("renders ColorPicker fields for foreground and background", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByTestId("qr-foreground")).toBeInTheDocument();
    expect(screen.getByTestId("qr-foreground-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("qr-background")).toBeInTheDocument();
    expect(screen.getByTestId("qr-background-trigger")).toBeInTheDocument();
  });
});
