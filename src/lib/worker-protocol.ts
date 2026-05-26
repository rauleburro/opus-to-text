export type MainToWorkerMessage =
  | { type: "init" }
  | {
      type: "transcribe";
      samples: Float32Array;
      sampleRate: number;
    };

export type WorkerToMainMessage =
  | { type: "model-loading-started" }
  | { type: "model-ready" }
  | { type: "transcribe-done"; text: string }
  | { type: "error"; message: string };
