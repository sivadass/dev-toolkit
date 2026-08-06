import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonVisualiserPage } from "./json-visualiser-page";

describe("JsonVisualiserPage", () => {
  it("renders title", () => {
    render(<JsonVisualiserPage />);
    expect(screen.getByText("JSON visualiser")).toBeInTheDocument();
  });
});
