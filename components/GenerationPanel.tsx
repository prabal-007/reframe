"use client";

import { useState } from "react";
import { GenerationStatus, GenerationResolution } from "@/lib/types";

interface GenerationPanelProps {
  /** Whether the user has made edits to the scene */
  hasUserEdits: boolean;
  /** Whether scene data exists */
  hasSceneData: boolean;
  /** Current generation status */
  status: GenerationStatus;
  /** Error message if any */
  error?: string | null;
  /** Callback when user wants to render */
  onRender: (options?: { resolution?: GenerationResolution }) => void;
  /** Callback to dismiss error */
  onDismissError?: () => void;
}

/**
 * GenerationPanel - "Render Reframed Output" controls
 * 
 * Philosophy:
 * - Only shows after scene understanding exists
 * - Render button only active after user edits
 * - Language: "Render refined version" not "Generate image"
 * - Minimal, professional, purposeful
 */
export default function GenerationPanel({
  hasUserEdits,
  hasSceneData,
  status,
  error,
  onRender,
  onDismissError,
}: GenerationPanelProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [resolution, setResolution] = useState<GenerationResolution>("768x768");

  const isGenerating = status === "generating";
  const canRender = hasSceneData && hasUserEdits && !isGenerating;

  if (!hasSceneData) {
    return null;
  }

  const handleRender = () => {
    onRender({ resolution });
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--ai-cyan)]" />
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            Synthesis
          </h3>
        </div>
        {hasSceneData && !hasUserEdits && (
          <span className="text-xs text-[var(--text-muted)]">
            Edit scene to enable
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-[var(--error)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-[var(--error)]">{error}</p>
              {onDismissError && (
                <button 
                  onClick={onDismissError}
                  className="mt-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Render Button */}
      <button
        onClick={handleRender}
        disabled={!canRender}
        className={`
          w-full py-3 px-4 rounded-xl font-medium text-sm
          flex items-center justify-center gap-2
          transition-all duration-200
          ${canRender
            ? "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent-primary)]/20"
            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
          }
        `}
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Rendering...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Render refined version</span>
          </>
        )}
      </button>

      {/* Options Toggle */}
      {canRender && !isGenerating && (
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <span>Options</span>
          <svg 
            className={`w-3 h-3 transition-transform ${showOptions ? "rotate-180" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Options Panel */}
      {showOptions && canRender && !isGenerating && (
        <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--glass-border)] space-y-3 animate-fade-in">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-2 block">
              Output Resolution
            </label>
            <div className="flex gap-2">
              {(["512x512", "768x768", "1024x1024"] as GenerationResolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`
                    flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all
                    ${resolution === res
                      ? "bg-[var(--accent-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30"
                      : "bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--glass-border)] hover:text-[var(--text-secondary)]"
                    }
                  `}
                >
                  {res.split("x")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-[var(--text-muted)] text-center">
        {isGenerating 
          ? "Synthesizing from scene understanding..."
          : hasUserEdits
            ? "Derived from your scene refinements"
            : "Make edits to the scene to enable rendering"
        }
      </p>
    </div>
  );
}

