import type { ModelFileProgress } from "../lib/transcription-state";

export interface ModelLoadingProgressProps {
  files: ModelFileProgress[];
}

const formatMB = (bytes?: number): string | null => {
  if (typeof bytes !== "number") return null;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
};

const FileRow = ({ file }: { file: ModelFileProgress }) => {
  const loadedLabel = formatMB(file.bytesLoaded);
  const totalLabel = formatMB(file.bytesTotal);
  const done = file.percent >= 100;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-mono text-slate-700">{file.name}</span>
        <span className="font-mono text-slate-500">{Math.round(file.percent)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(file.percent)}
        aria-label={file.name}
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className={`h-full transition-all ${done ? "bg-emerald-500" : "bg-slate-900"}`}
          style={{ width: `${file.percent}%` }}
        />
      </div>
      {loadedLabel && totalLabel && (
        <p className="text-[10px] text-slate-500">
          {loadedLabel} / {totalLabel}
        </p>
      )}
    </div>
  );
};

export function ModelLoadingProgress({ files }: ModelLoadingProgressProps) {
  if (files.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-700">Descargando modelo…</p>
        <div
          role="progressbar"
          aria-label="Descarga del modelo"
          className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        >
          <div className="h-full w-1/3 animate-pulse bg-slate-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-slate-700">Descargando modelo</p>
        <p className="text-xs text-slate-500">
          {files.length} {files.length === 1 ? "archivo" : "archivos"}
        </p>
      </div>
      <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
        {files.map((file) => (
          <FileRow key={file.name} file={file} />
        ))}
      </div>
    </div>
  );
}
