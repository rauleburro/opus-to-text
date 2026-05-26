export interface ModelLoadingProgressProps {
  percent?: number;
  file?: string;
  bytesLoaded?: number;
  bytesTotal?: number;
}

const formatMB = (bytes?: number): string | null => {
  if (typeof bytes !== "number") return null;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
};

export function ModelLoadingProgress({
  percent,
  file,
  bytesLoaded,
  bytesTotal,
}: ModelLoadingProgressProps) {
  const loadedLabel = formatMB(bytesLoaded);
  const totalLabel = formatMB(bytesTotal);
  const percentLabel = typeof percent === "number" ? `${Math.round(percent)}%` : "…";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-700">Descargando modelo</span>
        <span className="font-mono text-slate-500">{percentLabel}</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={typeof percent === "number" ? Math.round(percent) : undefined}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full bg-slate-900 transition-all"
          style={{ width: typeof percent === "number" ? `${percent}%` : "0%" }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
        {file && <span className="font-mono">{file}</span>}
        {loadedLabel && totalLabel && (
          <span>
            {loadedLabel} / {totalLabel}
          </span>
        )}
      </div>
    </div>
  );
}
