/// <reference lib="webworker" />
import { pipeline } from "@huggingface/transformers";
import type { MainToWorkerMessage, WorkerToMainMessage } from "../lib/worker-protocol";

declare const self: DedicatedWorkerGlobalScope;

type Transcriber = (
  input: Float32Array,
  options: Record<string, unknown>,
) => Promise<{ text?: string } | { text?: string }[]>;

interface ProgressInfo {
  status?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

const TARGET_SAMPLE_RATE = 16000;
const CHUNK_LENGTH_S = 30;

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
        {
          device: "wasm",
          progress_callback: (info: ProgressInfo) => {
            if (info.status === "progress" && typeof info.progress === "number") {
              post({
                type: "model-progress",
                percent: Math.round(info.progress),
                file: info.file,
                bytesLoaded: info.loaded,
                bytesTotal: info.total,
              });
            }
          },
        },
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

      const totalChunks = Math.max(
        1,
        Math.ceil(msg.samples.length / (CHUNK_LENGTH_S * TARGET_SAMPLE_RATE)),
      );
      let chunkIndex = 0;

      const output = await transcriber(msg.samples, {
        language: "spanish",
        task: "transcribe",
        return_timestamps: false,
        chunk_length_s: CHUNK_LENGTH_S,
        stride_length_s: 5,
        chunk_callback: () => {
          chunkIndex++;
          post({
            type: "transcribe-progress",
            chunkIndex: Math.min(chunkIndex, totalChunks),
            totalChunks,
          });
        },
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
