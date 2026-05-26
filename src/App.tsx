import { useTranscriber } from "./hooks/useTranscriber";
import { Dropzone } from "./components/Dropzone";
import { ModelLoadingProgress } from "./components/ModelLoadingProgress";
import { PrivacyNote } from "./components/PrivacyNote";
import { TranscriptionError } from "./components/TranscriptionError";
import { TranscriptionProgress } from "./components/TranscriptionProgress";
import { TranscriptionResult } from "./components/TranscriptionResult";

export function App() {
  const { state, backend, selectFile, reset } = useTranscriber();

  const canSelect = state.status === "model-ready";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-6 p-8">
        <header>
          <h1 className="text-3xl font-bold">opus-to-text</h1>
          <p className="mt-2 text-slate-600">
            Transcribí audios <code>.opus</code> a texto en español, todo en tu navegador.
          </p>
        </header>

        <PrivacyNote />

        <section className="space-y-4">
          {state.status === "idle" && (
            <p className="text-slate-500">Iniciando…</p>
          )}

          {state.status === "model-loading" && (
            <ModelLoadingProgress
              percent={state.percent}
              file={state.file}
              bytesLoaded={state.bytesLoaded}
              bytesTotal={state.bytesTotal}
            />
          )}

          {(state.status === "model-ready" ||
            state.status === "decoding" ||
            state.status === "transcribing") && (
            <Dropzone onFile={selectFile} disabled={!canSelect} />
          )}

          {state.status === "decoding" && (
            <p className="text-slate-500">Decodificando audio…</p>
          )}

          {state.status === "transcribing" && (
            <TranscriptionProgress
              chunkIndex={state.chunkIndex}
              totalChunks={state.totalChunks}
              backend={backend ?? undefined}
            />
          )}

          {state.status === "done" && (
            <TranscriptionResult
              text={state.text}
              fileName={state.fileName}
              onReset={reset}
            />
          )}

          {state.status === "error" && (
            <TranscriptionError message={state.message} onRetry={reset} />
          )}
        </section>
      </div>
    </main>
  );
}
