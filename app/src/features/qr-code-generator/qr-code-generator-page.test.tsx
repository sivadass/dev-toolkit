import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QrCodeGeneratorPage } from "./qr-code-generator-page";

describe("QrCodeGeneratorPage", () => {
  it("renders a visually hidden title and no Generate button", () => {
    render(<QrCodeGeneratorPage />);
    expect(
      screen.getByRole("heading", { name: "QR Code generator", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /generate/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Preview")).not.toBeInTheDocument();
    expect(screen.queryByText("Customization")).not.toBeInTheDocument();
  });

  it("disables download actions before a live result exists", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByRole("button", { name: /png/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /svg/i })).toBeDisabled();
  });

  it("renders content, colors, advanced, and logo controls", () => {
    render(<QrCodeGeneratorPage />);
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText(/Updates live/i)).toBeInTheDocument();
    expect(screen.getByText("Colors")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.getByTestId("qr-foreground")).toBeInTheDocument();
    expect(screen.getByTestId("qr-background")).toBeInTheDocument();
    expect(screen.getByTestId("qr-logo-file")).toBeInTheDocument();
    expect(screen.getByTestId("qr-size")).toBeInTheDocument();
    expect(screen.getByTestId("qr-ecc")).toBeInTheDocument();
  });
});
