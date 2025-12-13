"use client";

import { useCallback, useState } from "react";

interface ImageUploaderProps {
  onImageSelect: (imageDataUrl: string, file: File) => void;
  currentImage: string | null;
  isAnalyzing: boolean;
}

export default function ImageUploader({ 
  onImageSelect, 
  currentImage,
  isAnalyzing 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onImageSelect(dataUrl, file);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <div className="w-full">
      <div
        onClick={!isAnalyzing ? handleClick : undefined}
        onDrop={!isAnalyzing ? handleDrop : undefined}
        onDragOver={!isAnalyzing ? handleDragOver : undefined}
        onDragLeave={!isAnalyzing ? handleDragLeave : undefined}
        className={`
          relative overflow-hidden rounded-xl border-2 border-dashed 
          transition-all duration-[var(--motion-normal)] ease-[var(--ease-standard)]
          ${isDragging 
            ? "border-[var(--accent-primary)] bg-[var(--accent-soft)] scale-[1.01]" 
            : "border-[var(--glass-border)] hover:border-[var(--text-muted)] bg-[var(--bg-surface)]"
          }
          ${isAnalyzing ? "cursor-wait opacity-70" : "cursor-pointer"}
          ${currentImage ? "aspect-video" : "aspect-[4/3]"}
        `}
      >
        {currentImage ? (
          <div className="relative w-full h-full">
            <img
              src={currentImage}
              alt="Uploaded image"
              className="w-full h-full object-contain"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[var(--bg-root)]/80 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-[var(--ai-cyan)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[var(--ai-cyan)] font-medium text-sm tracking-wide">
                    Analyzing scene...
                  </span>
                </div>
              </div>
            )}
            {!isAnalyzing && (
              <div className="
                absolute inset-0 bg-[var(--bg-root)]/0 hover:bg-[var(--bg-root)]/60 
                backdrop-blur-0 hover:backdrop-blur-sm
                transition-all duration-[var(--motion-normal)]
                flex items-center justify-center opacity-0 hover:opacity-100
              ">
                <span className="
                  text-[var(--text-primary)] font-medium text-sm
                  bg-[var(--bg-elevated)] px-4 py-2 rounded-lg
                  shadow-lg
                ">
                  Click to replace
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
            <div className={`
              w-16 h-16 rounded-2xl 
              bg-[var(--accent-soft)]
              flex items-center justify-center 
              transition-transform duration-[var(--motion-normal)]
              ${isDragging ? "scale-110" : ""}
            `}>
              <svg 
                className="w-8 h-8 text-[var(--accent-primary)]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[var(--text-primary)] font-medium text-lg">
                Drop your image here
              </p>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              {["PNG", "JPG", "WebP"].map((format) => (
                <span 
                  key={format}
                  className="text-xs px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
