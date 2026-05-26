import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelLoadingProgress } from "./ModelLoadingProgress";

describe("ModelLoadingProgress — sin archivos", () => {
  it("renderea sin lanzar cuando files es vacío", () => {
    render(<ModelLoadingProgress files={[]} />);
    expect(screen.getByText(/descargando modelo/i)).toBeInTheDocument();
  });

  it("muestra indicador indeterminado si todavía no hay archivos", () => {
    render(<ModelLoadingProgress files={[]} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});

describe("ModelLoadingProgress — múltiples archivos", () => {
  it("renderea una progressbar por archivo", () => {
    render(
      <ModelLoadingProgress
        files={[
          { name: "encoder.onnx", percent: 50 },
          { name: "decoder.onnx", percent: 20 },
          { name: "tokenizer.json", percent: 100 },
        ]}
      />,
    );
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(3);
  });

  it("cada progressbar tiene su aria-valuenow correcto", () => {
    render(
      <ModelLoadingProgress
        files={[
          { name: "encoder.onnx", percent: 50 },
          { name: "decoder.onnx", percent: 20 },
        ]}
      />,
    );
    const bars = screen.getAllByRole("progressbar");
    expect(bars[0]).toHaveAttribute("aria-valuenow", "50");
    expect(bars[1]).toHaveAttribute("aria-valuenow", "20");
  });

  it("muestra el nombre de cada archivo", () => {
    render(
      <ModelLoadingProgress
        files={[
          { name: "encoder.onnx", percent: 50 },
          { name: "decoder.onnx", percent: 20 },
        ]}
      />,
    );
    expect(screen.getByText("encoder.onnx")).toBeInTheDocument();
    expect(screen.getByText("decoder.onnx")).toBeInTheDocument();
  });

  it("muestra MB descargados / total por archivo cuando hay bytes", () => {
    render(
      <ModelLoadingProgress
        files={[
          {
            name: "encoder.onnx",
            percent: 50,
            bytesLoaded: 50_000_000,
            bytesTotal: 100_000_000,
          },
        ]}
      />,
    );
    expect(screen.getByText(/50.*MB/)).toBeInTheDocument();
    expect(screen.getByText(/100.*MB/)).toBeInTheDocument();
  });

  it("muestra resumen global con cantidad de archivos", () => {
    render(
      <ModelLoadingProgress
        files={[
          { name: "a.onnx", percent: 100 },
          { name: "b.onnx", percent: 50 },
        ]}
      />,
    );
    expect(screen.getByText(/2.*archivos/i)).toBeInTheDocument();
  });
});
