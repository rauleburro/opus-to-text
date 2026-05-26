import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TranscriptionProgress } from "./TranscriptionProgress";

describe("TranscriptionProgress", () => {
  it("muestra label 'transcribiendo' cuando hay chunks", () => {
    render(<TranscriptionProgress chunkIndex={1} totalChunks={3} />);
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

  it("sin chunkIndex la barra interna está animada (pulse)", () => {
    const { container } = render(<TranscriptionProgress />);
    const inner = container.querySelector(".animate-pulse");
    expect(inner).not.toBeNull();
  });

  it("muestra mensaje 'preparando' antes del primer chunk", () => {
    render(<TranscriptionProgress />);
    expect(screen.getByText(/preparando|iniciando/i)).toBeInTheDocument();
  });

  it("muestra 'WebGPU' cuando backend='webgpu'", () => {
    render(<TranscriptionProgress backend="webgpu" />);
    expect(screen.getByText(/webgpu/i)).toBeInTheDocument();
  });

  it("muestra 'WASM (más lento)' cuando backend='wasm'", () => {
    render(<TranscriptionProgress backend="wasm" />);
    expect(screen.getByText(/wasm/i)).toBeInTheDocument();
    expect(screen.getByText(/más lento/i)).toBeInTheDocument();
  });

  it("sin backend no muestra etiqueta de backend", () => {
    render(<TranscriptionProgress />);
    expect(screen.queryByText(/webgpu/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/wasm/i)).not.toBeInTheDocument();
  });
});
