import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("renderea el título de la app", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /opus-to-text/i }),
    ).toBeInTheDocument();
  });

  it("aplica clases de Tailwind al main", () => {
    const { container } = render(<App />);
    const main = container.querySelector("main");
    expect(main).not.toBeNull();
    expect(main?.className).toMatch(/min-h-screen/);
  });
});
