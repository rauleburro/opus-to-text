import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "./Dropzone";

describe("Dropzone — minimal (slice 2)", () => {
  it("renderea un botón para seleccionar archivo", () => {
    render(<Dropzone onFile={() => {}} disabled={false} />);
    expect(
      screen.getByRole("button", { name: /seleccionar archivo/i }),
    ).toBeInTheDocument();
  });

  it("clickear el botón dispara el file picker (input file)", () => {
    render(<Dropzone onFile={() => {}} disabled={false} />);
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("file");
  });

  it("seleccionar un archivo dispara onFile con el File", async () => {
    const onFile = vi.fn();
    render(<Dropzone onFile={onFile} disabled={false} />);

    const file = new File([new Uint8Array([1, 2, 3])], "voz.opus", {
      type: "audio/ogg",
    });
    const input = screen.getByTestId("file-input") as HTMLInputElement;

    const user = userEvent.setup();
    await user.upload(input, file);

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile.mock.calls[0]![0].name).toBe("voz.opus");
  });

  it("muestra disabled cuando lo recibe por props", () => {
    render(<Dropzone onFile={() => {}} disabled={true} />);
    expect(screen.getByRole("button", { name: /seleccionar archivo/i })).toBeDisabled();
  });
});
