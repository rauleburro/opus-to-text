import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TranscriptionError } from "./TranscriptionError";

describe("TranscriptionError", () => {
  it("muestra el mensaje de error recibido", () => {
    render(<TranscriptionError message="Formato no soportado" onRetry={() => {}} />);
    expect(screen.getByText(/formato no soportado/i)).toBeInTheDocument();
  });

  it("muestra un encabezado claro de error", () => {
    render(<TranscriptionError message="boom" onRetry={() => {}} />);
    expect(screen.getByText(/hubo un error/i)).toBeInTheDocument();
  });

  it("renderea botón Reintentar", () => {
    render(<TranscriptionError message="x" onRetry={() => {}} />);
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  it("click en Reintentar invoca onRetry", async () => {
    const onRetry = vi.fn();
    render(<TranscriptionError message="x" onRetry={onRetry} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
