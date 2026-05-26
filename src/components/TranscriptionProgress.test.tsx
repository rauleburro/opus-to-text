import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TranscriptionProgress } from "./TranscriptionProgress";

describe("TranscriptionProgress", () => {
  it("muestra 'transcribiendo' como label base", () => {
    render(<TranscriptionProgress />);
    expect(screen.getByText(/transcribiendo/i)).toBeInTheDocument();
  });

  it("muestra 'chunk X de Y' cuando hay valores de progreso", () => {
    render(<TranscriptionProgress chunkIndex={2} totalChunks={5} />);
    expect(screen.getByText(/chunk\s+2\s+de\s+5/i)).toBeInTheDocument();
  });

  it("renderea progressbar con aria-valuenow correcto", () => {
    render(<TranscriptionProgress chunkIndex={3} totalChunks={6} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("sin chunkIndex muestra indicador indeterminado", () => {
    render(<TranscriptionProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
  });
});
