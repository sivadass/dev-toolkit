import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { JsonVisualiserPage } from "./json-visualiser-page";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );

  Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    }),
  });
});

describe("JsonVisualiserPage", () => {
  it("renders title, text mode editor, and graph pane", () => {
    render(<JsonVisualiserPage />);

    expect(screen.getByText("JSON visualiser")).toBeInTheDocument();
    expect(screen.getByTestId("json-graph-pane")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("toggles left pane to tree view", async () => {
    const user = userEvent.setup();

    render(<JsonVisualiserPage />);
    await user.click(screen.getByRole("button", { name: /tree/i }));

    expect(screen.getByTestId("json-tree-pane")).toBeInTheDocument();
  });

  it("shows valid status for sample JSON", () => {
    render(<JsonVisualiserPage />);

    expect(screen.getByText(/valid/i)).toBeInTheDocument();
  });
});
