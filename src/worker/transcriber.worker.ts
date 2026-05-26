/// <reference lib="webworker" />
import { pipeline } from "@huggingface/transformers";
import type { MainToWorkerMessage, WorkerToMainMessage } from "../lib/worker-protocol";

declare const self: DedicatedWorkerGlobalScope;

type Transcriber = (
  input: Float32Array,
  options: Record<string, unknown>,
) => Promise<{ text?: string } | { text?: string }[]>;

const post = (message: WorkerToMainMessage) => self.postMessage(message);

let transcriber: Transcriber | null = null;
let initPromise: Promise<void> | null = null;

const ensureModel = async (): Promise<void> => {
  if (transcriber) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    post({ type: "model-loading-started" });
    try {
      const pipe = (await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-small",
        { device: "wasm" },
      )) as unknown as Transcriber;
      transcriber = pipe;
      post({ type: "model-ready" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      post({ type: "error", message: `Falló la carga del modelo: ${message}` });
      throw error;
    }
  })();

  return initPromise;
};

self.addEventListener("message", async (event: MessageEvent<MainToWorkerMessage>) => {
  const msg = event.data;

  try {
    if (msg.type === "init") {
      await ensureModel();
      return;
    }

    if (msg.type === "transcribe") {
      await ensureModel();
      if (!transcriber) {
        post({ type: "error", message: "Modelo no inicializado" });
        return;
      }

      const output = await transcriber(msg.samples, {
        language: "spanish",
        task: "transcribe",
        return_timestamps: false,
        chunk_length_s: 30,
        stride_length_s: 5,
      });

      const text = Array.isArray(output)
        ? output.map((o) => o.text ?? "").join(" ")
        : (output.text ?? "");

      post({ type: "transcribe-done", text: text.trim() });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    post({ type: "error", message });
  }
});
