"use client";

import { useState, useCallback } from "react";

interface BatchUploaderProps {
  onFilesSelected: (files: Array<{ dataUrl: string; filename: string }>) => void;
  isProcessing: boolean;
  progress: { current: number; total: number };
}

export default function BatchUploader({ onFilesSelected, isProcessing, progress }: BatchUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Array<{ dataUrl: string; filename: string }>>([]);

  const processFiles = useCallback(async (files: FileList) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    
    const processed: Array<{ dataUrl: string; filename: string }> = [];
    
    for (const file of imageFiles) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      processed.push({ dataUrl, filename: file.name });
    }
    
    setPendingFiles(processed);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    };
    input.click();
  }, [processFiles]);

  const handleStartCataloging = () => {
    if (pendingFiles.length > 0) {
      onFilesSelected(pendingFiles);
      setPendingFiles([]);
    }
  };

  const removeFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={!isProcessing ? handleClick : undefined}
        onDrop={!isProcessing ? handleDrop : undefined}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        className={`
          relative rounded-xl border-2 border-dashed transition-all p-8
          ${isDragging 
            ? "border-teal-400 bg-teal-400/5" 
            : "border-zinc-700 hover:border-zinc-600 bg-zinc-900/50"
          }
          ${isProcessing ? "cursor-wait opacity-70" : "cursor-pointer"}
        `}
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isDragging ? "bg-teal-500/20" : "bg-zinc-800"
          }`}>
            <svg className={`w-6 h-6 ${isDragging ? "text-teal-400" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-zinc-200 font-medium">Drop images here</p>
            <p className="text-zinc-500 text-sm mt-1">or click to browse • Multiple files supported</p>
          </div>
          <div className="flex gap-2">
            {["PNG", "JPG", "WebP", "GIF"].map((format) => (
              <span key={format} className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-teal-300">
              Cataloging images...
            </span>
            <span className="text-sm text-teal-400">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Pending Files Preview */}
      {pendingFiles.length > 0 && !isProcessing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              {pendingFiles.length} image{pendingFiles.length > 1 ? "s" : ""} ready to catalog
            </span>
            <button
              onClick={() => setPendingFiles([])}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {pendingFiles.map((file, idx) => (
              <div key={idx} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800">
                  <img
                    src={file.dataUrl}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-xs text-zinc-500 truncate mt-1">{file.filename}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartCataloging}
            className="w-full py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Start Cataloging ({pendingFiles.length} images)
          </button>
        </div>
      )}
    </div>
  );
}










