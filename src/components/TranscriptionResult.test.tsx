import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TranscriptionResult } from "./TranscriptionResult";

let writeText: ReturnType<typeof vi.fn>;
const createObjectURL = vi.fn(() => "blob:mock");
const revokeObjectURL = vi.fn();

beforeEach(() => {
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => {} },
      configurable: true,
    });
  }
  writeText = vi.fn(async () => {});
  Object.defineProperty(navigator.clipboard, "writeText", {
    value: writeText,
    configurable: true,
  });
  vi.stubGlobal("URL", {
    ...globalThis.URL,
    createObjectURL,
    revokeObjectURL,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  writeText.mockClear();
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
});

describe("TranscriptionResult — render", () => {
  it("renderea el texto transcripto en un textarea readOnly", () => {
    render(
      <TranscriptionResult text="hola mundo" fileName="voz.opus" onReset={() => {}} />,
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("hola mundo");
    expect(textarea.readOnly).toBe(true);
  });

  it("muestra el nombre del archivo de audio original", () => {
    render(
      <TranscriptionResult text="x" fileName="voz-nota.opus" onReset={() => {}} />,
    );
    expect(screen.getByText(/voz-nota\.opus/)).toBeInTheDocument();
  });

  it("renderea los 3 botones de acción", () => {
    render(<TranscriptionResult text="x" fileName="x.opus" onReset={() => {}} />);
    expect(screen.getByRole("button", { name: /copiar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /descargar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /nueva transcripción/i })).toBeInTheDocument();
  });
});

describe("TranscriptionResult — Copiar", () => {
  it("click en Copiar invoca clipboard.writeText con el texto", async () => {
    render(
      <TranscriptionResult text="hola mundo" fileName="x.opus" onReset={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /copiar/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("hola mundo"));
  });

  it("click en Copiar cambia el label a 'Copiado ✓'", async () => {
    render(
      <TranscriptionResult text="hola" fileName="x.opus" onReset={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /copiar/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /copiado/i })).toBeInTheDocument(),
    );
  });
});

describe("TranscriptionResult — Descargar", () => {
  it("click en Descargar genera un Blob URL y dispara click en el anchor", async () => {
    let clickSpy: ReturnType<typeof vi.fn> | null = null;
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const el = originalCreate(tag);
      if (tag === "a") {
        clickSpy = vi.fn();
        Object.defineProperty(el, "click", { value: clickSpy, configurable: true });
      }
      return el;
    });

    render(
      <TranscriptionResult
        text="contenido transcripto"
        fileName="voz-nota.opus"
        onReset={() => {}}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /descargar/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).not.toBeNull();
    expect(clickSpy!).toHaveBeenCalledTimes(1);
  });

  it("el nombre del .txt descargado coincide con el audio sin extensión", async () => {
    let capturedAnchor: HTMLAnchorElement | null = null;
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const el = originalCreate(tag);
      if (tag === "a") {
        capturedAnchor = el as HTMLAnchorElement;
        Object.defineProperty(el, "click", { value: vi.fn(), configurable: true });
      }
      return el;
    });

    render(
      <TranscriptionResult
        text="x"
        fileName="voz-nota-de-ana.opus"
        onReset={() => {}}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /descargar/i }));

    expect(capturedAnchor).not.toBeNull();
    expect(capturedAnchor!.download).toBe("voz-nota-de-ana.txt");
  });
});

describe("TranscriptionResult — Nueva transcripción", () => {
  it("click en Nueva transcripción invoca onReset", async () => {
    const onReset = vi.fn();
    render(<TranscriptionResult text="x" fileName="x.opus" onReset={onReset} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /nueva transcripción/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
