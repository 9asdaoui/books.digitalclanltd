import { useCallback, useRef, useState } from "react";
import { Label } from "./ui/Label";
import { cn } from "../lib/cn";

type FileDropzoneProps = {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  previewUrl?: string | null;
};

export function FileDropzone({
  label,
  hint,
  accept,
  file,
  onFileSelect,
  previewUrl,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      onFileSelect(files[0]);
    },
    [onFileSelect],
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 text-center transition duration-150",
          isDragging
            ? "border-brand-400 bg-brand-500/10"
            : "border-surface-600/80 bg-surface-900/40 hover:border-brand-500/60 hover:bg-surface-800/50",
        )}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Cover preview" className="mb-3 max-h-28 rounded-lg object-cover shadow-lg" />
        ) : (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20 text-brand-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-4-4m4 4l4-4"
              />
            </svg>
          </div>
        )}
        <p className="text-sm font-medium text-surface-200">
          {file ? file.name : "Drag & drop or click to browse"}
        </p>
        <p className="mt-1 text-xs text-surface-500">{hint}</p>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="mt-3 text-xs text-red-400 hover:text-red-300"
          >
            Remove file
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
