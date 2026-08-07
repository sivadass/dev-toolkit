import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Base64Page } from "./base64-page";

beforeAll(() => {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub,
  });
});

describe("Base64Page", () => {
  it("renders title and disables Encode when input is empty", () => {
    render(<Base64Page />);
    expect(screen.getByRole("heading", { name: /^base64$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^encode$/i })).toBeDisabled();
  });

  it("encodes text and shows output", async () => {
    const user = userEvent.setup();
    render(<Base64Page />);

    await user.type(screen.getByTestId("base64-input"), "hello");
    await user.click(screen.getByRole("button", { name: /^encode$/i }));

    expect(screen.getByTestId("base64-output")).toHaveValue("aGVsbG8=");
  });

  it("switches to Decode and changes CTA label", async () => {
    const user = userEvent.setup();
    render(<Base64Page />);

    await user.click(screen.getByRole("link", { name: /^decode$/i }));
    expect(screen.getByRole("button", { name: /^decode$/i })).toBeDisabled();
  });

  it("shows an alert for invalid Base64 decode", async () => {
    const user = userEvent.setup();
    render(<Base64Page />);

    await user.click(screen.getByRole("link", { name: /^decode$/i }));
    await user.type(screen.getByTestId("base64-input"), "!!!not-base64!!!");
    await user.click(screen.getByRole("button", { name: /^decode$/i }));

    expect(screen.getByText(/invalid base64 input/i)).toBeInTheDocument();
  });

  it("clears the active panel", async () => {
    const user = userEvent.setup();
    render(<Base64Page />);

    await user.type(screen.getByTestId("base64-input"), "hello");
    await user.click(screen.getByRole("button", { name: /^encode$/i }));
    expect(screen.getByTestId("base64-output")).toHaveValue("aGVsbG8=");

    await user.click(screen.getByRole("button", { name: /^clear$/i }));
    expect(screen.getByTestId("base64-input")).toHaveValue("");
    expect(screen.getByTestId("base64-output")).toHaveValue("");
  });

  it("copies output when present", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<Base64Page />);
    await user.type(screen.getByTestId("base64-input"), "hello");
    await user.click(screen.getByRole("button", { name: /^encode$/i }));
    await user.click(screen.getByRole("button", { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith("aGVsbG8=");
    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });
});
