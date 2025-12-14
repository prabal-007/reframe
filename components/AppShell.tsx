"use client";

import React, { ReactNode } from "react";
import GlobalBar from "./GlobalBar";
import ToolRail from "./ToolRail";

interface AppShellProps {
  children: ReactNode;
  inspector?: ReactNode;
  onExport?: () => void;
}

export default function AppShell({ children, inspector, onExport }: AppShellProps) {
  const hasInspector = !!inspector;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Bar - spans full width */}
      <GlobalBar onExport={onExport} />

      {/* Main Content Area */}
      <div className={`
        flex-1 flex
        ${hasInspector ? 'app-shell-with-inspector' : ''}
      `}>
        {/* Tool Rail - Left side */}
        <ToolRail />

        {/* Visual Canvas - Main content area */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="visual-canvas flex-1">
            {children}
          </div>
        </main>

        {/* Inspector Panel - Right side (optional) */}
        {inspector}
      </div>
    </div>
  );
}

/* =========================================================================
   Canvas Layout Components
   ========================================================================= */

interface CanvasGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export function CanvasGrid({ children, columns = 2 }: CanvasGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {children}
    </div>
  );
}

interface CanvasSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function CanvasSection({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = "" 
}: CanvasSectionProps) {
  return (
    <section className={`panel-elevated p-5 ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

interface CanvasEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function CanvasEmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: CanvasEmptyStateProps) {
  return (
    <div className="panel-elevated p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="
        w-16 h-16 rounded-2xl 
        bg-[var(--bg-surface)] 
        flex items-center justify-center mb-4
        text-[var(--text-muted)]
      ">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}

/* =========================================================================
   AI Activity Bar (collapsible bottom bar)
   ========================================================================= */

interface AIActivityBarProps {
  status: "idle" | "processing" | "rendering" | "complete" | "error";
  message?: string;
  onDismiss?: () => void;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Auto-close after this many milliseconds (for complete/error states) */
  autoClose?: number;
}

export function AIActivityBar({ status, message, onDismiss, action, autoClose }: AIActivityBarProps) {
  // Auto-close effect
  React.useEffect(() => {
    if (autoClose && onDismiss && (status === "complete" || status === "error")) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss, status]);

  if (status === "idle" && !message) return null;

  const statusConfig = {
    idle: {
      bg: "bg-[var(--bg-surface)]",
      icon: null,
      color: "text-[var(--text-muted)]",
    },
    processing: {
      bg: "bg-[var(--ai-cyan-soft)]",
      icon: (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
      color: "text-[var(--ai-cyan)]",
    },
    rendering: {
      bg: "bg-[var(--accent-soft)]",
      icon: (
        <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "text-[var(--accent-primary)]",
    },
    complete: {
      bg: "bg-success-soft",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: "text-[var(--success)]",
    },
    error: {
      bg: "bg-error-soft",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-[var(--error)]",
    },
  };

  const config = statusConfig[status];
  const isProcessing = status === "processing" || status === "rendering";

  return (
    <div className={`
      fixed bottom-4 left-1/2 -translate-x-1/2
      px-4 py-2.5 rounded-xl
      ${config.bg}
      shadow-lg
      flex items-center gap-3
      animate-scale-in
      z-50
    `}>
      {config.icon && (
        <span className={config.color}>{config.icon}</span>
      )}
      <span className={`text-sm font-medium ${config.color}`}>
        {message || (status === "processing" ? "AI is analyzing..." : status === "rendering" ? "Rendering reframed output..." : "")}
      </span>
      {action && !isProcessing && (
        <button
          onClick={action.onClick}
          className="px-3 py-1 rounded-lg bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          {action.label}
        </button>
      )}
      {onDismiss && !isProcessing && (
        <button 
          onClick={onDismiss}
          className={`p-1 rounded hover:bg-[var(--bg-elevated)] ${config.color} opacity-60 hover:opacity-100`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

