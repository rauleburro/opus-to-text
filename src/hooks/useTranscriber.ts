import { useCallback, useEffect, useReducer, useRef } from "react";
import TranscriberWorker from "../worker/transcriber.worker?worker";
import { decodeAudio } from "../lib/audio-decoder";
import {
  initialState,
  reducer,
  type Event,
  type State,
} from "../lib/transcription-state";
import type { MainToWorkerMessage, WorkerToMainMessage } from "../lib/worker-protocol";

export interface UseTranscriberResult {
  state: State;
  selectFile: (file: File) => Promise<void>;
}

export function useTranscriber(): UseTranscriberResult {
  const [state, dispatch] = useReducer(reducer, initialState);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new TranscriberWorker();
    workerRef.current = worker;

    const listener = (event: MessageEvent<WorkerToMainMessage>) => {
      const msg = event.data;
      const mapped = mapWorkerMessage(msg);
      if (mapped) dispatch(mapped);
    };
    worker.addEventListener("message", listener);

    const initMessage: MainToWorkerMessage = { type: "init" };
    worker.postMessage(initMessage);

    return () => {
      worker.removeEventListener("message", listener);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const selectFile = useCallback(async (file: File) => {
    dispatch({ type: "file-selected", file });

    try {
      const { samples, sampleRate } = await decodeAudio(file);
      dispatch({ type: "decode-done" });

      const worker = workerRef.current;
      if (!worker) {
        dispatch({ type: "error", message: "Worker no inicializado" });
        return;
      }

      const message: MainToWorkerMessage = {
        type: "transcribe",
        samples,
        sampleRate,
      };
      worker.postMessage(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dispatch({ type: "error", message });
    }
  }, []);

  return { state, selectFile };
}

function mapWorkerMessage(msg: WorkerToMainMessage): Event | null {
  switch (msg.type) {
    case "model-loading-started":
      return { type: "model-loading-started" };
    case "model-ready":
      return { type: "model-ready" };
    case "transcribe-done":
      return { type: "transcribe-done", text: msg.text };
    case "error":
      return { type: "error", message: msg.message };
  }
}
