import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonComparerPage } from "./json-comparer-page";

describe("JsonComparerPage", () => {
  it("renders title and disables Compare when either side is empty", () => {
    render(<JsonComparerPage />);
    expect(screen.getByText("JSON comparer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compare/i })).toBeDisabled();
  });
});
