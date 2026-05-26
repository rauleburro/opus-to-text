export type MainToWorkerMessage =
  | { type: "init" }
  | {
      type: "transcribe";
      samples: Float32Array;
      sampleRate: number;
    };

export type Backend = "webgpu" | "wasm";

export type WorkerToMainMessage =
  | { type: "model-loading-started" }
  | {
      type: "model-progress";
      percent: number;
      file?: string;
      bytesLoaded?: number;
      bytesTotal?: number;
    }
  | { type: "backend"; backend: Backend }
  | { type: "model-ready" }
  | {
      type: "transcribe-progress";
      chunkIndex: number;
      totalChunks: number;
    }
  | { type: "transcribe-done"; text: string }
  | { type: "error"; message: string };
