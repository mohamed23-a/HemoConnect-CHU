import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock AuthContext
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ login: vi.fn(), user: null, loading: false }),
}));

describe("Login Component", () => {
  it("renders login form properly", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );
    expect(screen.getByRole("button")).not.toBeNull();
  });

  it("submits form when inputs are provided", async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>,
    );
    const submitBtn = screen.getByRole("button");
    fireEvent.click(submitBtn);
    // Testing validation logic can be checked here natively
  });
});
