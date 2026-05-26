export interface TranscriptionResultProps {
  text: string;
  fileName: string;
}

export function TranscriptionResult({ text, fileName }: TranscriptionResultProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-slate-500">
        Transcripción de <span className="font-mono">{fileName}</span>
      </div>
      <textarea
        readOnly
        value={text}
        className="min-h-[200px] w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}
