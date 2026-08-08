import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolSurface } from "./tool-surface";

describe("ToolSurface", () => {
  it("renders children inside a frosted surface", () => {
    const { container } = render(
      <ToolSurface>
        <p>Original</p>
      </ToolSurface>
    );
    expect(screen.getByText("Original")).toBeInTheDocument();
    expect(container.querySelector(".tool-surface")).toBeTruthy();
  });
});
