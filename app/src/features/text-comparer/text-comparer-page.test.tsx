import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextComparerPage } from "./text-comparer-page";

describe("TextComparerPage", () => {
  it("renders title and disables Compare when either side is empty", () => {
    render(<TextComparerPage />);
    expect(screen.getByText("Text comparer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compare/i })).toBeDisabled();
  });

  it("compares text and shows the Diff view", async () => {
    const user = userEvent.setup();
    render(<TextComparerPage />);

    await user.type(screen.getByTestId("text-left"), "Hello world");
    await user.type(screen.getByTestId("text-right"), "Hello DevToolkit");
    await user.click(screen.getByRole("button", { name: /compare/i }));

    expect(screen.getByTestId("text-diff-view")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy unified diff/i })).toBeInTheDocument();
  });

  it("clears the Diff when inputs change after compare", async () => {
    const user = userEvent.setup();
    render(<TextComparerPage />);

    await user.type(screen.getByTestId("text-left"), "one");
    await user.type(screen.getByTestId("text-right"), "two");
    await user.click(screen.getByRole("button", { name: /compare/i }));
    expect(screen.getByTestId("text-diff-view")).toBeInTheDocument();

    await user.type(screen.getByTestId("text-left"), "x");
    expect(screen.queryByTestId("text-diff-view")).not.toBeInTheDocument();
    expect(screen.getByText(/Diff output will appear here/i)).toBeInTheDocument();
  });

  it("swaps left and right text", async () => {
    const user = userEvent.setup();
    render(<TextComparerPage />);

    await user.type(screen.getByTestId("text-left"), "left-only");
    await user.type(screen.getByTestId("text-right"), "right-only");
    await user.click(screen.getByRole("button", { name: /^swap$/i }));

    expect(screen.getByTestId("text-left")).toHaveValue("right-only");
    expect(screen.getByTestId("text-right")).toHaveValue("left-only");
  });

  it("copies unified diff when a result exists", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<TextComparerPage />);

    await user.type(screen.getByTestId("text-left"), "a");
    await user.type(screen.getByTestId("text-right"), "b");
    await user.click(screen.getByRole("button", { name: /compare/i }));
    await user.click(screen.getByRole("button", { name: /copy unified diff/i }));

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
    expect(String(writeText.mock.calls[0]?.[0])).toContain("--- Left");
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  });
});
