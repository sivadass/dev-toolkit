import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ComingSoonPage } from "./coming-soon-page";

vi.mock("../config/tools", () => ({
  getToolById: (id: string) =>
    id === "future-tool"
      ? {
          id: "future-tool",
          title: "Future tool",
          description: "Not built yet",
          icon: "construction",
          path: "/tools/future-tool",
          status: "coming-soon" as const,
        }
      : undefined,
}));

describe("ComingSoonPage", () => {
  it("shows coming soon for a registered tool", () => {
    render(
      <MemoryRouter initialEntries={["/tools/future-tool"]}>
        <Routes>
          <Route path="/tools/:toolId" element={<ComingSoonPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Future tool")).toBeInTheDocument();
    expect(
      screen.getByText(/coming soon — this tool is not built yet/i)
    ).toBeInTheDocument();
  });
});
