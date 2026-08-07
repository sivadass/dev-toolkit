import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolPageHeader } from "./tool-page-header";

describe("ToolPageHeader", () => {
  it("renders kicker, display title, subtitle, and optional CTA", () => {
    render(
      <ToolPageHeader
        kicker="Client-side · Private"
        title="Image compressor"
        subtitle="Compress locally."
        primaryCta={<button type="button">Compress</button>}
      />
    );
    expect(screen.getByText(/client-side/i)).toHaveClass("tool-page-header__kicker");
    const heading = screen.getByRole("heading", {
      level: 1,
      name: /image compressor/i,
    });
    expect(heading).toHaveClass("tool-page-header__title");
    expect(screen.getByText(/compress locally/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compress/i })).toBeInTheDocument();
  });

  it("omits CTA row actions when primaryCta is absent", () => {
    render(<ToolPageHeader title="Base64" subtitle="Encode text." />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
