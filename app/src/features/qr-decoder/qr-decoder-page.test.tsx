import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QrDecoderPage } from "./qr-decoder-page";

describe("QrDecoderPage", () => {
  it("renders title and disabled decode action", () => {
    render(<QrDecoderPage />);
    expect(screen.getByText("QR Code Reader")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /decode/i })).toBeDisabled();
  });
});
