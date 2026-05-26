import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelLoadingProgress } from "./ModelLoadingProgress";

describe("ModelLoadingProgress", () => {
  it("muestra el percent recibido como número visible", () => {
    render(<ModelLoadingProgress percent={42} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it("renderea un progressbar con valor correcto", () => {
    render(<ModelLoadingProgress percent={75} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "75");
  });

  it("muestra el nombre del archivo cuando se provee", () => {
    render(<ModelLoadingProgress percent={20} file="encoder.onnx" />);
    expect(screen.getByText(/encoder\.onnx/)).toBeInTheDocument();
  });

  it("muestra MB descargados / total cuando hay bytes", () => {
    render(
      <ModelLoadingProgress
        percent={50}
        bytesLoaded={50_000_000}
        bytesTotal={100_000_000}
      />,
    );
    expect(screen.getByText(/50.*MB/)).toBeInTheDocument();
    expect(screen.getByText(/100.*MB/)).toBeInTheDocument();
  });

  it("sin percent muestra estado indeterminado (sin throw)", () => {
    render(<ModelLoadingProgress />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
