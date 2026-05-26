export interface TranscriptionErrorProps {
  message: string;
  onRetry: () => void;
}

export function TranscriptionError({ message, onRetry }: TranscriptionErrorProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
      <p className="font-medium">Hubo un error</p>
      <p className="mt-1 text-sm">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50"
      >
        Reintentar
      </button>
    </div>
  );
}
