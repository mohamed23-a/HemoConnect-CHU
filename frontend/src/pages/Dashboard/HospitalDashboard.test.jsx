import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import HospitalDashboard from "./HospitalDashboard";

// Mocks
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Dr. Test", role: "hospital" } }),
}));

vi.mock("../../services/dashboardService", () => ({
  default: {
    getStats: vi.fn().mockResolvedValue({ data: { pending_demandes: 5 } }),
  },
}));

vi.mock("../../services/demandeService", () => ({
  default: {
    getDemandes: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe("HospitalDashboard Component", () => {
  it("renders dashboard sections clearly", () => {
    render(
      <BrowserRouter>
        <HospitalDashboard />
      </BrowserRouter>,
    );
    expect(screen.getByText("nav.dashboard")).not.toBeNull();
    expect(screen.getByText("common.welcome")).not.toBeNull();
  });
});
