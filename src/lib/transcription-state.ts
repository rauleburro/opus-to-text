export type State =
  | { status: "idle" }
  | {
      status: "model-loading";
      percent?: number;
      file?: string;
      bytesLoaded?: number;
      bytesTotal?: number;
    }
  | { status: "model-ready" }
  | { status: "decoding"; fileName: string }
  | {
      status: "transcribing";
      fileName: string;
      chunkIndex?: number;
      totalChunks?: number;
    }
  | { status: "done"; fileName: string; text: string }
  | { status: "error"; message: string };

export type Event =
  | { type: "model-loading-started" }
  | {
      type: "model-progress";
      percent: number;
      file?: string;
      bytesLoaded?: number;
      bytesTotal?: number;
    }
  | { type: "model-ready" }
  | { type: "file-selected"; file: File }
  | { type: "decode-done" }
  | { type: "transcribe-progress"; chunkIndex: number; totalChunks: number }
  | { type: "transcribe-done"; text: string }
  | { type: "error"; message: string };

export const initialState: State = { status: "idle" };

export function reducer(state: State, event: Event): State {
  if (event.type === "error") {
    return { status: "error", message: event.message };
  }

  switch (state.status) {
    case "idle":
      if (event.type === "model-loading-started") {
        return { status: "model-loading" };
      }
      return state;

    case "model-loading":
      if (event.type === "model-ready") {
        return { status: "model-ready" };
      }
      if (event.type === "model-progress") {
        return {
          status: "model-loading",
          percent: event.percent,
          file: event.file,
          bytesLoaded: event.bytesLoaded,
          bytesTotal: event.bytesTotal,
        };
      }
      return state;

    case "model-ready":
      if (event.type === "file-selected") {
        return { status: "decoding", fileName: event.file.name };
      }
      return state;

    case "decoding":
      if (event.type === "decode-done") {
        return { status: "transcribing", fileName: state.fileName };
      }
      return state;

    case "transcribing":
      if (event.type === "transcribe-progress") {
        return {
          status: "transcribing",
          fileName: state.fileName,
          chunkIndex: event.chunkIndex,
          totalChunks: event.totalChunks,
        };
      }
      if (event.type === "transcribe-done") {
        return { status: "done", fileName: state.fileName, text: event.text };
      }
      return state;

    case "done":
    case "error":
      return state;
  }
}
