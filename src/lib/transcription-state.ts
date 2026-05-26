export type State =
  | { status: "idle" }
  | { status: "model-loading" }
  | { status: "model-ready" }
  | { status: "decoding"; fileName: string }
  | { status: "transcribing"; fileName: string }
  | { status: "done"; fileName: string; text: string }
  | { status: "error"; message: string };

export type Event =
  | { type: "model-loading-started" }
  | { type: "model-ready" }
  | { type: "file-selected"; file: File }
  | { type: "decode-done" }
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
      if (event.type === "transcribe-done") {
        return { status: "done", fileName: state.fileName, text: event.text };
      }
      return state;

    case "done":
    case "error":
      return state;
  }
}
