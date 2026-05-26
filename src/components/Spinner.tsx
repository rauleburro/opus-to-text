export interface SpinnerProps {
  label: string;
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <div role="status" className="flex items-center gap-3 text-slate-700">
      <span
        aria-hidden="true"
        className="animate-spin inline-block h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-900"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
