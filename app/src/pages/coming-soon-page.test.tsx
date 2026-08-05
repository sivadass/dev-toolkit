import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ComingSoonPage } from "./coming-soon-page";

describe("ComingSoonPage", () => {
  it("shows coming soon for a registered tool", () => {
    render(
      <MemoryRouter initialEntries={["/tools/base64"]}>
        <Routes>
          <Route path="/tools/:toolId" element={<ComingSoonPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Base64")).toBeInTheDocument();
    expect(
      screen.getByText(/coming soon — this tool is not built yet/i)
    ).toBeInTheDocument();
  });
});
