"use client";

import { usePathname } from "next/navigation";

interface GlobalBarProps {
  onExport?: () => void;
}

const modeNames: Record<string, string> = {
  "/": "Scene Editor",
  "/accessibility": "Accessibility",
  "/products": "Products",
  "/remix": "Remix",
  "/catalog": "Catalog",
};

const modeDescriptions: Record<string, string> = {
  "/": "Visual Reasoning Mode",
  "/accessibility": "Perspective Shift",
  "/products": "Variant Intelligence",
  "/remix": "Visual DNA Lab",
  "/catalog": "Visual Spreadsheet",
};

export default function GlobalBar({ onExport }: GlobalBarProps) {
  const pathname = usePathname();
  const currentMode = modeNames[pathname] || "Reframe";
  const modeDescription = modeDescriptions[pathname] || "";

  return (
    <header className="global-bar">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[#7C3AED] flex items-center justify-center">
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-primary leading-none">Reframe</h1>
          <p className="text-xs text-muted mt-0.5">Visual Intelligence</p>
        </div>
      </div>

      {/* Divider */}
      <div className="divider-vertical h-6 mx-5" />

      {/* Current Mode */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-primary">{currentMode}</span>
        {modeDescription && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent-primary)]">
            {modeDescription}
          </span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* AI Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--ai-cyan-soft)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--ai-cyan)] animate-pulse-subtle" />
          <span className="text-xs font-medium text-[var(--ai-cyan)]">AI Ready</span>
        </div>

        {/* Export Button (if handler provided) */}
        {onExport && (
          <button 
            onClick={onExport}
            className="btn-ghost"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        )}

        {/* Version Badge */}
        <span className="text-xs px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-muted">
          v1.0
        </span>
      </div>
    </header>
  );
}

