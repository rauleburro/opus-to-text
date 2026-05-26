import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TranscriptionResult } from "./TranscriptionResult";

describe("TranscriptionResult — minimal (slice 2)", () => {
  it("renderea el texto transcripto en un textarea readOnly", () => {
    render(<TranscriptionResult text="hola mundo" fileName="voz.opus" />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("hola mundo");
    expect(textarea.readOnly).toBe(true);
  });

  it("muestra el nombre del archivo de audio original", () => {
    render(<TranscriptionResult text="x" fileName="voz-nota.opus" />);
    expect(screen.getByText(/voz-nota\.opus/)).toBeInTheDocument();
  });
});
