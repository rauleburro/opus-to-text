export type MainToWorkerMessage =
  | { type: "init" }
  | {
      type: "transcribe";
      samples: Float32Array;
      sampleRate: number;
    };

export type WorkerToMainMessage =
  | { type: "model-loading-started" }
  | {
      type: "model-progress";
      percent: number;
      file?: string;
      bytesLoaded?: number;
      bytesTotal?: number;
    }
  | { type: "model-ready" }
  | {
      type: "transcribe-progress";
      chunkIndex: number;
      totalChunks: number;
    }
  | { type: "transcribe-done"; text: string }
  | { type: "error"; message: string };
