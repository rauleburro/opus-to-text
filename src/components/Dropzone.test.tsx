import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "./Dropzone";

const makeFile = (name = "voz.opus") =>
  new File([new Uint8Array([1, 2, 3])], name, { type: "audio/ogg" });

describe("Dropzone — render", () => {
  it("renderea un botón para seleccionar archivo", () => {
    render(<Dropzone onFile={() => {}} disabled={false} />);
    expect(
      screen.getByRole("button", { name: /seleccionar archivo/i }),
    ).toBeInTheDocument();
  });

  it("muestra las extensiones aceptadas", () => {
    render(<Dropzone onFile={() => {}} disabled={false} />);
    expect(screen.getByText(/\.opus/)).toBeInTheDocument();
    expect(screen.getByText(/\.mp3/)).toBeInTheDocument();
  });

  it("muestra disabled cuando lo recibe por props", () => {
    render(<Dropzone onFile={() => {}} disabled={true} />);
    expect(
      screen.getByRole("button", { name: /seleccionar archivo/i }),
    ).toBeDisabled();
  });
});

describe("Dropzone — file picker", () => {
  it("input file dispara onFile cuando el usuario sube un archivo", async () => {
    const onFile = vi.fn();
    render(<Dropzone onFile={onFile} disabled={false} />);

    const input = screen.getByTestId("file-input") as HTMLInputElement;
    const user = userEvent.setup();
    await user.upload(input, makeFile());

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile.mock.calls[0]![0].name).toBe("voz.opus");
  });
});

describe("Dropzone — drag and drop", () => {
  it("dragOver agrega clase visual de hover", () => {
    render(<Dropzone onFile={() => {}} disabled={false} />);
    const zone = screen.getByTestId("dropzone");
    fireEvent.dragOver(zone, { dataTransfer: { files: [makeFile()] } });
    expect(zone.className).toMatch(/dragging|hover|active/);
  });

  it("dragLeave saca la clase visual de hover", () => {
    render(<Dropzone onFile={() => {}} disabled={false} />);
    const zone = screen.getByTestId("dropzone");
    fireEvent.dragOver(zone, { dataTransfer: { files: [makeFile()] } });
    fireEvent.dragLeave(zone);
    expect(zone.className).not.toMatch(/dragging-over/);
  });

  it("drop dispara onFile con el archivo soltado", () => {
    const onFile = vi.fn();
    render(<Dropzone onFile={onFile} disabled={false} />);

    const zone = screen.getByTestId("dropzone");
    const file = makeFile("nota.mp3");
    fireEvent.drop(zone, {
      dataTransfer: { files: [file] },
    });

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile.mock.calls[0]![0].name).toBe("nota.mp3");
  });

  it("drop con varios archivos sólo toma el primero", () => {
    const onFile = vi.fn();
    render(<Dropzone onFile={onFile} disabled={false} />);

    const zone = screen.getByTestId("dropzone");
    fireEvent.drop(zone, {
      dataTransfer: {
        files: [makeFile("a.opus"), makeFile("b.opus")],
      },
    });

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile.mock.calls[0]![0].name).toBe("a.opus");
  });

  it("drop cuando está disabled no dispara onFile", () => {
    const onFile = vi.fn();
    render(<Dropzone onFile={onFile} disabled={true} />);

    const zone = screen.getByTestId("dropzone");
    fireEvent.drop(zone, { dataTransfer: { files: [makeFile()] } });

    expect(onFile).not.toHaveBeenCalled();
  });
});
