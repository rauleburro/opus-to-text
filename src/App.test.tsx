import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

vi.mock("./worker/transcriber.worker?worker", () => ({
  default: vi.fn(() => ({
    postMessage: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    terminate: vi.fn(),
  })),
}));

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
