import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomePage } from "./home-page";

describe("HomePage", () => {
  function renderHome() {
    return render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
  }

  it("lists all tools including PDF compressor", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /image compressor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pdf compressor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /qr code generator/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /qr code reader/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /json comparer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /json visualiser/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /text comparer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /base64/i })).toBeInTheDocument();
  });

  it("uses quiet craft hero: kicker, display headline, short lead", () => {
    renderHome();
    expect(screen.getByText(/client-side/i)).toBeInTheDocument();
    const heading = screen.getByRole("heading", {
      level: 1,
      name: /tools that stay in your browser/i,
    });
    expect(heading).toHaveClass("home__headline");
    expect(screen.getByText(/never uploaded/i)).toBeInTheDocument();
  });

  it("renders frosted tiles without Ready/Soon badges", () => {
    const { container } = renderHome();
    expect(screen.queryAllByText(/^ready$/i)).toHaveLength(0);
    expect(container.querySelector(".tool-tile")).toBeTruthy();
    expect(container.querySelector(".tool-card-link")).toBeNull();
  });
});
