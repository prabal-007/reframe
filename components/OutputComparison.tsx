"use client";

import { useState } from "react";
import Image from "next/image";
import { GeneratedOutput, VisionStructOutput } from "@/lib/types";

interface OutputComparisonProps {
  /** Original source image */
  sourceImage: string;
  /** Generated/reframed output */
  generatedOutput: GeneratedOutput;
  /** Scene data used for generation */
  sceneData?: VisionStructOutput;
  /** Callback when user accepts the output */
  onAccept?: () => void;
  /** Callback when user discards the output */
  onDiscard?: () => void;
  /** Callback when user wants to regenerate */
  onRegenerate?: () => void;
  /** Callback to download the output */
  onDownload?: () => void;
}

/**
 * OutputComparison - Side-by-side comparison of original and reframed output
 * 
 * Philosophy:
 * - Reinforces causality: Original → Reframed
 * - Trust through transparency: Shows lineage
 * - Inspectability: Metadata always visible
 * - Reversible: Clear accept/discard actions
 * - "Use This" is positioned close to the reframed output (ties action to outcome)
 */
export default function OutputComparison({
  sourceImage,
  generatedOutput,
  sceneData,
  onAccept,
  onDiscard,
  onRegenerate,
  onDownload,
}: OutputComparisonProps) {
  const [showLineage, setShowLineage] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<"source" | "generated" | null>(null);

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Default download behavior
    const link = document.createElement("a");
    link.href = generatedOutput.generatedImageUrl;
    link.download = `reframed_${generatedOutput.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
          <h3 className="text-sm font-medium text-[var(--text-primary)]">
            Output Comparison
          </h3>
        </div>
        <button
          onClick={() => setShowLineage(!showLineage)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Lineage</span>
        </button>
      </div>

      {/* Side-by-Side Comparison with Actions tied to outputs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Original Image Column */}
        <div className="space-y-2">
          <div 
            className={`
              relative rounded-xl overflow-hidden border transition-all duration-200
              ${hoveredSide === "source" 
                ? "border-[var(--text-muted)] shadow-lg" 
                : "border-[var(--glass-border)]"
              }
            `}
            onMouseEnter={() => setHoveredSide("source")}
            onMouseLeave={() => setHoveredSide(null)}
          >
            <div className="aspect-square relative bg-[var(--bg-elevated)]">
              <Image
                src={sourceImage}
                alt="Original source image"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs text-white/80 font-medium">Original</p>
              <p className="text-xs text-white/50">Source image</p>
            </div>
          </div>
          
          {/* Secondary actions under original */}
          <div className="flex gap-2">
            {onDiscard && (
              <button
                onClick={onDiscard}
                className="flex-1 py-2 px-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--glass-border)] text-[var(--text-muted)] text-xs font-medium hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Discard</span>
              </button>
            )}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="py-2 px-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--glass-border)] text-[var(--text-muted)] text-xs font-medium hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]/30 transition-colors flex items-center justify-center gap-1.5"
                title="Regenerate"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Generated Output Column - Primary action here */}
        <div className="space-y-2">
          <div 
            className={`
              relative rounded-xl overflow-hidden border transition-all duration-200
              ${hoveredSide === "generated" 
                ? "border-[var(--ai-cyan)] shadow-lg shadow-[var(--ai-cyan)]/10" 
                : "border-[var(--glass-border)]"
              }
            `}
            onMouseEnter={() => setHoveredSide("generated")}
            onMouseLeave={() => setHoveredSide(null)}
          >
            <div className="aspect-square relative bg-[var(--bg-elevated)]">
              <Image
                src={generatedOutput.generatedImageUrl}
                alt="Reframed output"
                fill
                className="object-cover"
              />
              {/* AI Badge */}
              <div className="absolute top-2 right-2">
                <span className="ai-badge">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Reframed
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs text-white/80 font-medium">Reframed Output</p>
              <p className="text-xs text-white/50">
                {formatTimestamp(generatedOutput.timestamp)} • {generatedOutput.metadata.resolution}
              </p>
            </div>
          </div>
          
          {/* Primary action "Use This" directly under the reframed output */}
          <div className="flex gap-2">
            {onAccept && (
              <button
                onClick={onAccept}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[var(--success)] text-white text-sm font-medium hover:bg-[var(--success)]/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[var(--success)]/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Use This</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--glass-border)] text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]/30 transition-colors flex items-center justify-center"
              title="Download"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Lineage Panel */}
      {showLineage && (
        <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--glass-border)] space-y-2 animate-fade-in">
          <h4 className="text-xs font-medium text-[var(--text-secondary)]">Generation Lineage</h4>
          <div className="space-y-1 text-xs text-[var(--text-muted)]">
            <div className="flex justify-between">
              <span>Model</span>
              <span className="text-[var(--text-secondary)]">{generatedOutput.metadata.model}</span>
            </div>
            <div className="flex justify-between">
              <span>Resolution</span>
              <span className="text-[var(--text-secondary)]">{generatedOutput.metadata.resolution}</span>
            </div>
            <div className="flex justify-between">
              <span>Generated</span>
              <span className="text-[var(--text-secondary)]">{new Date(generatedOutput.timestamp).toLocaleString()}</span>
            </div>
            {sceneData && (
              <div className="flex justify-between">
                <span>Scene</span>
                <span className="text-[var(--text-secondary)] truncate max-w-[150px]">
                  {sceneData.global_context.scene_description.slice(0, 30)}...
                </span>
              </div>
            )}
          </div>
          {generatedOutput.metadata.promptSnapshot && (
            <div className="pt-2 border-t border-[var(--glass-border)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Prompt used:</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {generatedOutput.metadata.promptSnapshot}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-[var(--text-muted)] text-center">
        Derived from scene understanding • Traceable lineage maintained
      </p>
    </div>
  );
}
