import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacyNote } from "./PrivacyNote";

describe("PrivacyNote", () => {
  it("muestra el texto clave sobre privacidad", () => {
    render(<PrivacyNote />);
    expect(screen.getByText(/nunca se sube/i)).toBeInTheDocument();
  });

  it("menciona que el procesamiento es local", () => {
    render(<PrivacyNote />);
    expect(screen.getByText(/tu dispositivo|en tu navegador/i)).toBeInTheDocument();
  });
});
