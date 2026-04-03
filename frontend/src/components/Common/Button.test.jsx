import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button Component", () => {
  it("renders correctly with children", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).not.toBeNull();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Click Me</Button>);
    const btn = screen.getByText("Click Me");
    expect(btn.disabled).toBe(true);
  });
});
