import { useTranscriber } from "./hooks/useTranscriber";
import { Dropzone } from "./components/Dropzone";
import { TranscriptionResult } from "./components/TranscriptionResult";

export function App() {
  const { state, selectFile } = useTranscriber();

  const canSelect = state.status === "model-ready";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">opus-to-text</h1>
          <p className="mt-2 text-slate-600">
            Transcribí audios <code>.opus</code> a texto en español, todo en tu navegador.
          </p>
        </header>

        <section className="space-y-4">
          {state.status === "idle" && (
            <p className="text-slate-500">Iniciando…</p>
          )}

          {state.status === "model-loading" && (
            <p className="text-slate-500">Descargando modelo (puede tardar la primera vez)…</p>
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
            <p className="text-slate-500">Transcribiendo…</p>
          )}

          {state.status === "done" && (
            <TranscriptionResult text={state.text} fileName={state.fileName} />
          )}

          {state.status === "error" && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
              <p className="font-medium">Hubo un error</p>
              <p className="mt-1 text-sm">{state.message}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
