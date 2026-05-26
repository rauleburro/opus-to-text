import type { Backend } from "../lib/worker-protocol";

export interface TranscriptionProgressProps {
  chunkIndex?: number;
  totalChunks?: number;
  backend?: Backend;
}

const backendLabel = (backend: Backend): string =>
  backend === "webgpu" ? "Procesando con WebGPU" : "Procesando con WASM (más lento)";

export function TranscriptionProgress({
  chunkIndex,
  totalChunks,
  backend,
}: TranscriptionProgressProps) {
  const hasProgress =
    typeof chunkIndex === "number" && typeof totalChunks === "number" && totalChunks > 0;
  const percent = hasProgress ? Math.round((chunkIndex / totalChunks) * 100) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-700">Transcribiendo…</span>
        {hasProgress && (
          <span className="font-mono text-slate-500">
            chunk {chunkIndex} de {totalChunks}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? undefined}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full bg-slate-900 transition-all"
          style={{ width: percent !== null ? `${percent}%` : "30%" }}
        />
      </div>
      {backend && (
        <p className="text-xs text-slate-500">{backendLabel(backend)}</p>
      )}
    </div>
  );
}
