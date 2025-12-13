"use client";

import { useState } from "react";
import { VisionStructOutput } from "@/lib/types";

interface JsonViewerProps {
  data: VisionStructOutput;
  isExpanded?: boolean;
}

export default function JsonViewer({ data, isExpanded: initialExpanded = false }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-[var(--bg-surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <div 
        className="
          flex items-center justify-between px-4 py-3 
          bg-[var(--bg-elevated)] cursor-pointer 
          hover:bg-[var(--bg-glass)] 
          transition-colors duration-[var(--motion-fast)]
        "
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <svg 
            className={`
              w-4 h-4 text-[var(--text-muted)] 
              transition-transform duration-[var(--motion-fast)]
              ${isExpanded ? "rotate-90" : ""}
            `}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[var(--text-secondary)] font-medium text-sm">Raw JSON Blueprint</span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent-primary)]">
            {data.objects?.length || 0} objects
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="btn-ghost text-xs py-1.5"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </div>
      
      {isExpanded && (
        <div className="max-h-96 overflow-auto animate-fade-in">
          <pre className="p-4 text-xs font-mono text-[var(--text-muted)] leading-relaxed">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
