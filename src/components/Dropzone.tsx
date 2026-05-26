import { useRef, type ChangeEvent } from "react";

export interface DropzoneProps {
  onFile: (file: File) => void;
  disabled: boolean;
}

export function Dropzone({ onFile, disabled }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFile(file);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-white p-8">
      <p className="text-slate-600">Subí un archivo .opus para transcribirlo</p>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
      >
        Seleccionar archivo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".opus,audio/ogg"
        onChange={handleChange}
        data-testid="file-input"
        className="hidden"
      />
    </div>
  );
}
