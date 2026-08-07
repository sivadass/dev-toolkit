import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomePage } from "./home-page";

describe("HomePage", () => {
  it("lists all tools including PDF compressor", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /image compressor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pdf compressor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /qr code generator/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /qr code reader/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /json comparer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /text comparer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /base64/i })).toBeInTheDocument();
  });
});
