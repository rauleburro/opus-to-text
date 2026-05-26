import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renderea un elemento accesible con role status", () => {
    render(<Spinner label="Cargando" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("incluye texto de label visible", () => {
    render(<Spinner label="Decodificando audio" />);
    expect(screen.getByText(/decodificando audio/i)).toBeInTheDocument();
  });

  it("aplica clase de animación", () => {
    const { container } = render(<Spinner label="x" />);
    const anim = container.querySelector(".animate-spin");
    expect(anim).not.toBeNull();
  });
});
