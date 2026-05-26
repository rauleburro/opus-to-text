import { describe, expect, it } from "vitest";
import { initialState, reducer, type Event, type State } from "./transcription-state";

const fakeFile = (name = "audio.opus") =>
  new File([new Uint8Array([1, 2, 3])], name, { type: "audio/ogg" });

describe("transcription-state — initial state", () => {
  it("arranca en idle", () => {
    expect(initialState.status).toBe("idle");
  });
});

describe("transcription-state — happy path", () => {
  it("idle + model-loading-started → model-loading", () => {
    const next = reducer(initialState, { type: "model-loading-started" });
    expect(next.status).toBe("model-loading");
  });

  it("model-loading + model-ready → model-ready", () => {
    const next = reducer(
      { status: "model-loading" },
      { type: "model-ready" },
    );
    expect(next.status).toBe("model-ready");
  });

  it("model-ready + file-selected → decoding y guarda fileName", () => {
    const file = fakeFile("voz-nota.opus");
    const next = reducer({ status: "model-ready" }, { type: "file-selected", file });
    expect(next.status).toBe("decoding");
    if (next.status === "decoding") {
      expect(next.fileName).toBe("voz-nota.opus");
    }
  });

  it("decoding + decode-done → transcribing preservando fileName", () => {
    const next = reducer(
      { status: "decoding", fileName: "voz.opus" },
      { type: "decode-done" },
    );
    expect(next.status).toBe("transcribing");
    if (next.status === "transcribing") {
      expect(next.fileName).toBe("voz.opus");
    }
  });

  it("transcribing + transcribe-done(text) → done con texto y fileName", () => {
    const next = reducer(
      { status: "transcribing", fileName: "voz.opus" },
      { type: "transcribe-done", text: "hola mundo" },
    );
    expect(next.status).toBe("done");
    if (next.status === "done") {
      expect(next.text).toBe("hola mundo");
      expect(next.fileName).toBe("voz.opus");
    }
  });
});

describe("transcription-state — errores", () => {
  it("acepta error desde cualquier estado", () => {
    const states: State[] = [
      { status: "idle" },
      { status: "model-loading" },
      { status: "model-ready" },
      { status: "decoding", fileName: "x" },
      { status: "transcribing", fileName: "x" },
      { status: "done", fileName: "x", text: "y" },
    ];
    for (const state of states) {
      const next = reducer(state, { type: "error", message: "boom" });
      expect(next.status).toBe("error");
      if (next.status === "error") {
        expect(next.message).toBe("boom");
      }
    }
  });
});

describe("transcription-state — transiciones inválidas son no-op", () => {
  it("idle + file-selected → idle (modelo no cargó)", () => {
    const file = fakeFile();
    const next = reducer(initialState, { type: "file-selected", file });
    expect(next).toEqual(initialState);
  });

  it("model-ready + decode-done → model-ready (no había decode en curso)", () => {
    const state: State = { status: "model-ready" };
    const next = reducer(state, { type: "decode-done" });
    expect(next).toEqual(state);
  });

  it("done + model-loading-started → done (idempotente)", () => {
    const state: State = { status: "done", fileName: "x", text: "y" };
    const next = reducer(state, { type: "model-loading-started" });
    expect(next).toEqual(state);
  });

  it("evento desconocido no cambia el estado", () => {
    const state: State = { status: "model-ready" };
    // @ts-expect-error — evento inválido a propósito
    const next = reducer(state, { type: "nonexistent" });
    expect(next).toEqual(state);
  });
});

describe("transcription-state — progreso (slice 3)", () => {
  it("model-loading + model-progress actualiza payload sin cambiar status", () => {
    const next = reducer(
      { status: "model-loading" },
      {
        type: "model-progress",
        percent: 42,
        file: "model.onnx",
        bytesLoaded: 1000,
        bytesTotal: 2500,
      },
    );
    expect(next.status).toBe("model-loading");
    if (next.status === "model-loading") {
      expect(next.percent).toBe(42);
      expect(next.file).toBe("model.onnx");
      expect(next.bytesLoaded).toBe(1000);
      expect(next.bytesTotal).toBe(2500);
    }
  });

  it("model-progress fuera de model-loading es no-op", () => {
    const state: State = { status: "model-ready" };
    const next = reducer(state, { type: "model-progress", percent: 50 });
    expect(next).toEqual(state);
  });

  it("transcribing + transcribe-progress actualiza chunkIndex/totalChunks", () => {
    const next = reducer(
      { status: "transcribing", fileName: "voz.opus" },
      { type: "transcribe-progress", chunkIndex: 2, totalChunks: 5 },
    );
    expect(next.status).toBe("transcribing");
    if (next.status === "transcribing") {
      expect(next.fileName).toBe("voz.opus");
      expect(next.chunkIndex).toBe(2);
      expect(next.totalChunks).toBe(5);
    }
  });

  it("transcribe-progress fuera de transcribing es no-op", () => {
    const state: State = { status: "decoding", fileName: "voz.opus" };
    const next = reducer(state, {
      type: "transcribe-progress",
      chunkIndex: 1,
      totalChunks: 3,
    });
    expect(next).toEqual(state);
  });
});

describe("transcription-state — type narrowing", () => {
  it("permite TypeScript narrow correctamente en cada estado", () => {
    const state: State = { status: "done", fileName: "a.opus", text: "hola" };
    if (state.status === "done") {
      // si compila este bloque, el narrowing funciona
      const expectsString: string = state.text;
      const expectsFileName: string = state.fileName;
      expect(expectsString).toBe("hola");
      expect(expectsFileName).toBe("a.opus");
    }
  });

  it("Event type es discriminado por type", () => {
    const event: Event = { type: "transcribe-done", text: "hola" };
    if (event.type === "transcribe-done") {
      const text: string = event.text;
      expect(text).toBe("hola");
    }
  });
});
