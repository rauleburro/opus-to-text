import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { SUPPORTED_EXTENSIONS } from "../lib/audio-decoder";

export interface DropzoneProps {
  onFile: (file: File) => void;
  disabled: boolean;
}

const acceptAttribute = SUPPORTED_EXTENSIONS.join(",");

export function Dropzone({ onFile, disabled }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFile(file);
    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const baseClasses =
    "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors";
  const stateClasses = isDraggingOver
    ? "dragging-over border-slate-900 bg-slate-100"
    : "border-slate-300 bg-white";

  return (
    <div
      data-testid="dropzone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${baseClasses} ${stateClasses}`}
    >
      <p className="text-slate-600">
        Arrastrá un archivo de audio o usá el botón
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
      >
        Seleccionar archivo
      </button>
      <p className="text-xs text-slate-500">
        Formatos aceptados:{" "}
        {SUPPORTED_EXTENSIONS.map((ext, i) => (
          <span key={ext} className="font-mono">
            {i > 0 ? ", " : ""}
            {ext}
          </span>
        ))}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttribute}
        onChange={handleChange}
        data-testid="file-input"
        className="hidden"
      />
    </div>
  );
}
