import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTranscriber } from "./useTranscriber";
import type { WorkerToMainMessage } from "../lib/worker-protocol";

/**
 * Mock del Web Worker. Capturamos los mensajes posteados al worker, y
 * permitimos disparar mensajes "desde el worker" hacia el hook con `emit`.
 */
class FakeWorker {
  public posted: unknown[] = [];
  public listeners: ((ev: MessageEvent<WorkerToMainMessage>) => void)[] = [];

  postMessage(msg: unknown) {
    this.posted.push(msg);
  }

  addEventListener(
    _type: "message",
    listener: (ev: MessageEvent<WorkerToMainMessage>) => void,
  ) {
    this.listeners.push(listener);
  }

  removeEventListener(
    _type: "message",
    listener: (ev: MessageEvent<WorkerToMainMessage>) => void,
  ) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  terminate() {}

  emit(data: WorkerToMainMessage) {
    const event = { data } as MessageEvent<WorkerToMainMessage>;
    for (const listener of this.listeners) listener(event);
  }
}

let fakeWorker: FakeWorker;
let decodeAudioMock: ReturnType<typeof vi.fn>;

vi.mock("../worker/transcriber.worker?worker", () => ({
  default: vi.fn(() => fakeWorker),
}));

vi.mock("../lib/audio-decoder", () => ({
  decodeAudio: (input: File | ArrayBuffer) => decodeAudioMock(input),
}));

beforeEach(() => {
  fakeWorker = new FakeWorker();
  decodeAudioMock = vi.fn(async () => ({
    samples: new Float32Array(16000),
    sampleRate: 16000,
  }));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useTranscriber", () => {
  it("arranca en estado idle y dispara init al worker en mount", () => {
    const { result } = renderHook(() => useTranscriber());
    expect(result.current.state.status).toBe("idle");
    expect(fakeWorker.posted).toContainEqual({ type: "init" });
  });

  it("model-loading-started del worker → estado model-loading", async () => {
    const { result } = renderHook(() => useTranscriber());
    act(() => fakeWorker.emit({ type: "model-loading-started" }));
    await waitFor(() => expect(result.current.state.status).toBe("model-loading"));
  });

  it("model-ready del worker → estado model-ready", async () => {
    const { result } = renderHook(() => useTranscriber());
    act(() => {
      fakeWorker.emit({ type: "model-loading-started" });
      fakeWorker.emit({ type: "model-ready" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("model-ready"));
  });

  it("selectFile decodifica audio y postea transcribe al worker", async () => {
    const { result } = renderHook(() => useTranscriber());
    act(() => {
      fakeWorker.emit({ type: "model-loading-started" });
      fakeWorker.emit({ type: "model-ready" });
    });

    const file = new File([new Uint8Array([1, 2, 3])], "voz.opus", { type: "audio/ogg" });
    await act(async () => {
      await result.current.selectFile(file);
    });

    expect(decodeAudioMock).toHaveBeenCalledWith(file);
    expect(fakeWorker.posted).toContainEqual(
      expect.objectContaining({
        type: "transcribe",
        sampleRate: 16000,
      }),
    );
  });

  it("transcribe-done del worker → estado done con texto y fileName", async () => {
    const { result } = renderHook(() => useTranscriber());
    act(() => {
      fakeWorker.emit({ type: "model-loading-started" });
      fakeWorker.emit({ type: "model-ready" });
    });

    const file = new File([new Uint8Array([1, 2, 3])], "voz.opus", { type: "audio/ogg" });
    await act(async () => {
      await result.current.selectFile(file);
    });

    act(() => {
      fakeWorker.emit({ type: "transcribe-done", text: "hola mundo" });
    });

    await waitFor(() => expect(result.current.state.status).toBe("done"));
    if (result.current.state.status === "done") {
      expect(result.current.state.text).toBe("hola mundo");
      expect(result.current.state.fileName).toBe("voz.opus");
    }
  });

  it("error del worker → estado error con mensaje", async () => {
    const { result } = renderHook(() => useTranscriber());
    act(() => fakeWorker.emit({ type: "error", message: "boom" }));

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    if (result.current.state.status === "error") {
      expect(result.current.state.message).toBe("boom");
    }
  });

  it("model-progress del worker actualiza el payload del state model-loading", async () => {
    const { result } = renderHook(() => useTranscriber());
    act(() => {
      fakeWorker.emit({ type: "model-loading-started" });
      fakeWorker.emit({
        type: "model-progress",
        percent: 37,
        file: "encoder.onnx",
        bytesLoaded: 1234,
        bytesTotal: 5678,
      });
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("model-loading");
      if (result.current.state.status === "model-loading") {
        expect(result.current.state.percent).toBe(37);
        expect(result.current.state.file).toBe("encoder.onnx");
      }
    });
  });

  it("transcribe-progress del worker actualiza chunkIndex/totalChunks", async () => {
    const { result } = renderHook(() => useTranscriber());
    act(() => {
      fakeWorker.emit({ type: "model-loading-started" });
      fakeWorker.emit({ type: "model-ready" });
    });

    const file = new File([new Uint8Array([1])], "voz.opus");
    await act(async () => {
      await result.current.selectFile(file);
    });

    act(() => {
      fakeWorker.emit({
        type: "transcribe-progress",
        chunkIndex: 2,
        totalChunks: 5,
      });
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("transcribing");
      if (result.current.state.status === "transcribing") {
        expect(result.current.state.chunkIndex).toBe(2);
        expect(result.current.state.totalChunks).toBe(5);
      }
    });
  });

  it("reset desde done vuelve a model-ready", async () => {
    const { result } = renderHook(() => useTranscriber());
    act(() => {
      fakeWorker.emit({ type: "model-loading-started" });
      fakeWorker.emit({ type: "model-ready" });
    });

    const file = new File([new Uint8Array([1])], "voz.opus");
    await act(async () => {
      await result.current.selectFile(file);
    });
    act(() => fakeWorker.emit({ type: "transcribe-done", text: "hola" }));

    await waitFor(() => expect(result.current.state.status).toBe("done"));

    act(() => result.current.reset());
    expect(result.current.state.status).toBe("model-ready");
  });

  it("error en decodeAudio se propaga como evento error", async () => {
    decodeAudioMock.mockRejectedValueOnce(new Error("decode failed"));

    const { result } = renderHook(() => useTranscriber());
    act(() => {
      fakeWorker.emit({ type: "model-loading-started" });
      fakeWorker.emit({ type: "model-ready" });
    });

    const file = new File([new Uint8Array([1])], "bad.opus");
    await act(async () => {
      await result.current.selectFile(file);
    });

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    if (result.current.state.status === "error") {
      expect(result.current.state.message).toMatch(/decode failed/i);
    }
  });
});
