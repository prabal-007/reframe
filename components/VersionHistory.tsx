"use client";

import { useState } from "react";
import { VersionHistoryEntry, GeneratedOutput } from "@/lib/types";

interface VersionHistoryProps {
  /** History entries to display */
  entries: VersionHistoryEntry[];
  /** Currently selected entry ID */
  selectedId?: string;
  /** Callback when an entry is selected */
  onSelect?: (entry: VersionHistoryEntry) => void;
  /** Callback to clear history */
  onClear?: () => void;
}

const typeIcons: Record<VersionHistoryEntry["type"], JSX.Element> = {
  upload: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  analysis: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  edit: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  generation: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const typeColors: Record<VersionHistoryEntry["type"], string> = {
  upload: "text-[var(--text-muted)]",
  analysis: "text-[var(--accent-primary)]",
  edit: "text-[var(--warning)]",
  generation: "text-[var(--ai-cyan)]",
};

const typeLabels: Record<VersionHistoryEntry["type"], string> = {
  upload: "Uploaded",
  analysis: "Analyzed",
  edit: "Edited",
  generation: "Rendered",
};

/**
 * VersionHistory - Timeline showing the lineage of an image
 * 
 * Shows:
 * - Original upload
 * - Understanding generated
 * - Edits made
 * - Outputs rendered
 * 
 * Reinforces: Causality, Trust, Inspectability
 */
export default function VersionHistory({
  entries,
  selectedId,
  onSelect,
  onClear,
}: VersionHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const displayEntries = expanded ? entries : entries.slice(0, 5);
  const hasMore = entries.length > 5;

  if (entries.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-[var(--text-muted)]">No history yet</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Upload an image to start tracking lineage
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            Version History
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            ({entries.length})
          </span>
        </div>
        {onClear && entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[var(--glass-border)]" />

        <div className="space-y-1">
          {displayEntries.map((entry, index) => {
            const isSelected = entry.id === selectedId;
            const isGeneration = entry.type === "generation";
            const generatedData = isGeneration ? (entry.data as GeneratedOutput) : null;

            return (
              <button
                key={entry.id}
                onClick={() => onSelect?.(entry)}
                className={`
                  w-full flex items-start gap-3 p-2 rounded-lg text-left transition-all
                  ${isSelected 
                    ? "bg-[var(--accent-soft)] border border-[var(--accent-primary)]/20" 
                    : "hover:bg-[var(--bg-elevated)]"
                  }
                `}
              >
                {/* Icon dot */}
                <div className={`
                  relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0
                  ${isSelected 
                    ? "bg-[var(--accent-primary)]" 
                    : "bg-[var(--bg-elevated)] border border-[var(--glass-border)]"
                  }
                  ${typeColors[entry.type]}
                `}>
                  {typeIcons[entry.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`
                      text-xs font-medium
                      ${isSelected ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}
                    `}>
                      {typeLabels[entry.type]}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] shrink-0">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                    {entry.description}
                  </p>

                  {/* Generation preview */}
                  {generatedData && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[var(--bg-surface)] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={generatedData.generatedImageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-[var(--ai-cyan)]">
                        {generatedData.metadata.resolution}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Show more/less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>
              <span>Show less</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>Show {entries.length - 5} more</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}

