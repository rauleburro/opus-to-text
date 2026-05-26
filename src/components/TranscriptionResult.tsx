import { useEffect, useState } from "react";

export interface TranscriptionResultProps {
  text: string;
  fileName: string;
  onReset: () => void;
}

const stripExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0) return fileName;
  return fileName.slice(0, lastDot);
};

export function TranscriptionResult({ text, fileName, onReset }: TranscriptionResultProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // si el clipboard no está disponible, sin feedback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${stripExtension(fileName)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-slate-500">
        Transcripción de <span className="font-mono">{fileName}</span>
      </div>
      <textarea
        readOnly
        value={text}
        className="min-h-[200px] w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50"
        >
          Descargar .txt
        </button>
        <button
          type="button"
          onClick={onReset}
          className="ml-auto rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Nueva transcripción
        </button>
      </div>
    </div>
  );
}
