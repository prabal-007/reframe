"use client";

import { ReactNode } from "react";

interface InspectorSection {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface InspectorPanelProps {
  title: string;
  subtitle?: string;
  sections: InspectorSection[];
  footer?: ReactNode;
}

export default function InspectorPanel({ 
  title, 
  subtitle, 
  sections, 
  footer 
}: InspectorPanelProps) {
  return (
    <aside className="inspector-panel flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-[var(--glass-border)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
        )}
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <InspectorSectionComponent key={section.id} section={section} />
        ))}
      </div>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-[var(--glass-border)]">
          {footer}
        </div>
      )}
    </aside>
  );
}

function InspectorSectionComponent({ section }: { section: InspectorSection }) {
  return (
    <details 
      className="group border-b border-[var(--glass-border)]" 
      open={section.defaultOpen !== false}
    >
      <summary className="
        flex items-center gap-2 px-4 py-3 cursor-pointer
        text-sm font-medium text-[var(--text-secondary)]
        hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]
        transition-colors duration-[var(--motion-fast)]
        list-none
      ">
        {/* Expand Icon */}
        <svg 
          className="w-4 h-4 transition-transform duration-[var(--motion-fast)] group-open:rotate-90" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        
        {section.icon && (
          <span className="text-[var(--text-muted)]">{section.icon}</span>
        )}
        
        <span>{section.title}</span>
      </summary>
      
      <div className="px-4 pb-4 animate-fade-in">
        {section.children}
      </div>
    </details>
  );
}

/* =========================================================================
   Reusable Inspector Field Components
   ========================================================================= */

interface InspectorFieldProps {
  label: string;
  children: ReactNode;
}

export function InspectorField({ label, children }: InspectorFieldProps) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

interface InspectorValueProps {
  value: string | number;
  copyable?: boolean;
}

export function InspectorValue({ value, copyable }: InspectorValueProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
  };

  return (
    <div className="
      flex items-center justify-between gap-2 
      px-3 py-2 rounded-lg bg-[var(--bg-elevated)]
    ">
      <span className="text-sm text-[var(--text-primary)] truncate">{value}</span>
      {copyable && (
        <button 
          onClick={handleCopy}
          className="
            p-1 rounded text-[var(--text-muted)] 
            hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]
            transition-colors duration-[var(--motion-fast)]
          "
          title="Copy"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface InspectorChipsProps {
  items: string[];
  onRemove?: (item: string) => void;
}

export function InspectorChips({ items, onRemove }: InspectorChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span 
          key={item}
          className="
            inline-flex items-center gap-1 px-2 py-1 
            rounded-md bg-[var(--bg-elevated)] 
            text-xs text-[var(--text-secondary)]
          "
        >
          {item}
          {onRemove && (
            <button 
              onClick={() => onRemove(item)}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

interface InspectorColorProps {
  color: string;
  label?: string;
}

export function InspectorColor({ color, label }: InspectorColorProps) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-6 h-6 rounded-md border border-[var(--glass-border)]"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-[var(--text-secondary)]">
        {label || color}
      </span>
    </div>
  );
}

/* =========================================================================
   Generation Status Indicator
   ========================================================================= */

type GenerationStatusType = "idle" | "generating" | "complete" | "error";

interface InspectorGenerationStatusProps {
  status: GenerationStatusType;
  message?: string;
  hasEdits?: boolean;
}

export function InspectorGenerationStatus({ 
  status, 
  message,
  hasEdits 
}: InspectorGenerationStatusProps) {
  const statusConfig = {
    idle: {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "text-[var(--text-muted)]",
      bgColor: "bg-[var(--bg-elevated)]",
      label: hasEdits ? "Ready to render" : "Make edits to enable",
    },
    generating: {
      icon: (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
      color: "text-[var(--ai-cyan)]",
      bgColor: "bg-[var(--ai-cyan-soft)]",
      label: "Rendering...",
    },
    complete: {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: "text-[var(--success)]",
      bgColor: "bg-[var(--success)]/10",
      label: "Output ready",
    },
    error: {
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-[var(--error)]",
      bgColor: "bg-[var(--error)]/10",
      label: "Render failed",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg
      ${config.bgColor}
    `}>
      <span className={config.color}>{config.icon}</span>
      <span className={`text-sm ${config.color}`}>
        {message || config.label}
      </span>
    </div>
  );
}

