"use client";

import { useState, useCallback } from "react";
import { VisualDNA } from "@/lib/remix-prompts";

interface StyleTransferProps {
  visualDNA: VisualDNA;
}

interface TransferResult {
  transfer_prompt: string;
  style_application_notes: string;
  before_after_summary: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-xs text-zinc-400 hover:text-zinc-200"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

export default function StyleTransfer({ visualDNA }: StyleTransferProps) {
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [elements, setElements] = useState({
    keepColors: true,
    keepLighting: true,
    keepComposition: true,
    keepMood: true,
    keepTextures: true,
  });

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setTargetImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

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

  const handleTransfer = useCallback(async () => {
    if (!targetImage) return;

    setIsTransferring(true);
    try {
      const response = await fetch("/api/remix/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visualDNA,
          targetImage,
          customElements: elements,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.transferResult);
      }
    } catch (err) {
      console.error("Transfer error:", err);
    }
    setIsTransferring(false);
  }, [targetImage, visualDNA, elements]);

  const toggleElement = (key: keyof typeof elements) => {
    setElements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const elementButtons = [
    { key: "keepMood" as const, label: "Style & Mood", icon: "🎭" },
    { key: "keepColors" as const, label: "Colors", icon: "🎨" },
    { key: "keepLighting" as const, label: "Lighting", icon: "💡" },
    { key: "keepComposition" as const, label: "Composition", icon: "📐" },
    { key: "keepTextures" as const, label: "Textures", icon: "🧱" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 p-4">
        <h4 className="text-sm font-medium text-rose-300 mb-2 flex items-center gap-2">
          <span>🔄</span> Style Transfer
        </h4>
        <p className="text-xs text-zinc-400">
          Upload a target photo and apply the reference style to it. 
          Perfect for "I want THIS photo in THAT style" scenarios.
        </p>
      </div>

      {/* Target Image Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-300 block">
          Target Photo (your photo to restyle)
        </label>
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          className={`
            relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
            ${isDragging 
              ? "border-rose-400 bg-rose-400/5" 
              : targetImage 
                ? "border-zinc-700 bg-zinc-900/50" 
                : "border-zinc-700 hover:border-zinc-600 bg-zinc-900/50"
            }
            ${targetImage ? "aspect-video" : "py-8"}
          `}
        >
          {targetImage ? (
            <div className="relative w-full h-full">
              <img
                src={targetImage}
                alt="Target image"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg text-sm">
                  Click to replace
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-zinc-300 text-sm font-medium">Drop your target photo here</p>
                <p className="text-zinc-500 text-xs mt-1">or click to browse</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Elements to Transfer */}
      {targetImage && (
        <div className="space-y-3 animate-fade-in">
          <label className="text-sm font-medium text-zinc-300 block">
            Style Elements to Apply
          </label>
          <div className="flex flex-wrap gap-2">
            {elementButtons.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => toggleElement(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                  elements[key]
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-zinc-800 text-zinc-500 border border-transparent hover:text-zinc-300"
                }`}
              >
                <span>{icon}</span>
                {label}
                {elements[key] && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transfer Button */}
      {targetImage && (
        <button
          onClick={handleTransfer}
          disabled={isTransferring}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isTransferring
              ? "bg-rose-500/20 text-rose-400"
              : "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
          }`}
        >
          {isTransferring ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Transferring Style...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Apply Reference Style to This Photo
            </>
          )}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-green-500/10 flex items-center justify-between">
            <div>
              <span className="font-medium text-green-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Style Transfer Complete
              </span>
              <p className="text-xs text-zinc-500 mt-1">{result.before_after_summary}</p>
            </div>
            <CopyButton text={result.transfer_prompt} />
          </div>
          <div className="p-4">
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">
              {result.transfer_prompt}
            </p>
            {result.style_application_notes && (
              <p className="text-xs text-zinc-600 italic">
                💡 {result.style_application_notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      {!targetImage && (
        <div className="rounded-xl bg-zinc-800/30 border border-zinc-700/50 p-4">
          <h5 className="text-sm font-medium text-zinc-300 mb-3">How Style Transfer Works</h5>
          <div className="space-y-2 text-xs text-zinc-500">
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">1.</span>
              <span>Reference image's Visual DNA is already extracted (left panel)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">2.</span>
              <span>Upload your target photo above</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">3.</span>
              <span>AI analyzes your photo's content (subject, setting, composition)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">4.</span>
              <span>Generates a prompt: your content + reference style</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

