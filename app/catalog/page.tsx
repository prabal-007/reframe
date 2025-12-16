"use client";

import { useState, useCallback } from "react";
import AppShell, { CanvasSection, CanvasEmptyState, AIActivityBar } from "@/components/AppShell";
import InspectorPanel, { InspectorField, InspectorValue } from "@/components/InspectorPanel";
import BatchUploader from "@/components/BatchUploader";
import CatalogEntryCard from "@/components/CatalogEntryCard";
import { CatalogEntry, formatForExport, ExportFormat } from "@/lib/catalog-prompts";

export default function CatalogPage() {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CatalogEntry | null>(null);

  const handleFilesSelected = useCallback(async (files: Array<{ dataUrl: string; filename: string }>) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });
    setError(null);

    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length });

      try {
        const response = await fetch("/api/catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: files[i].dataUrl,
            filename: files[i].filename,
          }),
        });

        const data = await response.json();

        if (response.ok && data.entry) {
          setEntries(prev => [...prev, data.entry]);
        } else {
          console.error(`Failed to catalog ${files[i].filename}:`, data.error);
        }
      } catch (err) {
        console.error(`Error cataloging ${files[i].filename}:`, err);
      }
    }

    setIsProcessing(false);
  }, []);

  const handleRemoveEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  }, [selectedEntry]);

  const handleExport = useCallback((format: ExportFormat) => {
    const content = formatForExport(entries, format);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalog-export.${format === "csv" ? "csv" : format === "json" ? "json" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const handleClearAll = useCallback(() => {
    if (confirm("Clear all cataloged entries?")) {
      setEntries([]);
      setSelectedEntry(null);
    }
  }, []);

  const totalTags = entries.reduce((sum, e) => 
    sum + e.metadata.tags.primary.length + e.metadata.tags.secondary.length, 0
  );

  // Build inspector sections for selected entry
  const inspectorSections = selectedEntry ? [
    {
      id: "info",
      title: "Image Info",
      defaultOpen: true,
      children: (
        <div className="space-y-3">
          <InspectorField label="Filename">
            <InspectorValue value={selectedEntry.filename} />
          </InspectorField>
          <InspectorField label="SEO Title">
            <InspectorValue value={selectedEntry.metadata.seo.title} copyable />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "tags",
      title: `Tags (${selectedEntry.metadata.tags.primary.length + selectedEntry.metadata.tags.secondary.length})`,
      defaultOpen: true,
      children: (
        <div className="space-y-3">
          <InspectorField label="Primary">
            <div className="flex flex-wrap gap-1">
              {selectedEntry.metadata.tags.primary.slice(0, 8).map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent-primary)]">
                  {tag}
                </span>
              ))}
            </div>
          </InspectorField>
          <InspectorField label="Secondary">
            <div className="flex flex-wrap gap-1">
              {selectedEntry.metadata.tags.secondary.slice(0, 6).map((tag, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  {tag}
                </span>
              ))}
            </div>
          </InspectorField>
        </div>
      ),
    },
    {
      id: "colors",
      title: "Colors",
      children: (
        <div className="space-y-3">
          <InspectorField label="Dominant">
            <div className="flex gap-1">
              {selectedEntry.metadata.visual_elements.dominant_colors.slice(0, 5).map((color, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 rounded border border-[var(--glass-border)]"
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name} (${color.percentage}%)`}
                />
              ))}
            </div>
          </InspectorField>
        </div>
      ),
    },
    {
      id: "context",
      title: "Context",
      children: (
        <div className="space-y-3">
          <InspectorField label="Setting">
            <InspectorValue value={selectedEntry.metadata.context.setting} />
          </InspectorField>
          <InspectorField label="Time">
            <InspectorValue value={selectedEntry.metadata.context.time_of_day || "Unknown"} />
          </InspectorField>
          <InspectorField label="Mood">
            <InspectorValue value={selectedEntry.metadata.mood_atmosphere.primary_mood || "Neutral"} />
          </InspectorField>
        </div>
      ),
    },
  ] : [
    {
      id: "stats",
      title: "Catalog Stats",
      defaultOpen: true,
      children: (
        <div className="space-y-3">
          <InspectorField label="Total Images">
            <InspectorValue value={entries.length.toString()} />
          </InspectorField>
          <InspectorField label="Total Tags">
            <InspectorValue value={totalTags.toString()} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "export",
      title: "Export Options",
      defaultOpen: true,
      children: entries.length > 0 ? (
        <div className="space-y-2">
          <button
            onClick={() => handleExport("json")}
            className="w-full py-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--ai-cyan-soft)] text-[var(--ai-cyan)]">JSON</span>
            Full Metadata
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="w-full py-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span className="text-xs px-1.5 py-0.5 rounded bg-success-soft text-[var(--success)]">CSV</span>
            Spreadsheet
          </button>
          <button
            onClick={() => handleExport("keywords")}
            className="w-full py-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span className="text-xs px-1.5 py-0.5 rounded bg-warning-soft text-[var(--warning)]">TXT</span>
            Keywords Only
          </button>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Upload images to enable export</p>
      ),
    },
  ];

  const aiStatus = isProcessing 
    ? "processing" 
    : error 
      ? "error" 
      : entries.length > 0 
        ? "complete" 
        : "idle";

  return (
    <AppShell
      inspector={
        <InspectorPanel
          title={selectedEntry ? "Image Details" : "Catalog Overview"}
          subtitle={selectedEntry ? "Selected image metadata" : "Batch cataloging"}
          sections={inspectorSections}
          footer={
            entries.length > 0 && !selectedEntry ? (
              <button
                onClick={handleClearAll}
                className="w-full py-2 rounded-lg border border-[var(--error)]/20 text-[var(--error)] hover:bg-error-soft transition-colors text-sm"
              >
                Clear All Entries
              </button>
            ) : selectedEntry ? (
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-full py-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
              >
                Back to Overview
              </button>
            ) : undefined
          }
        />
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="
            p-4 rounded-xl 
            bg-error-soft border border-[var(--error)]/20 
            text-[var(--error)] 
            flex items-center gap-3 
            animate-fade-in
          ">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-[var(--error)]/60 hover:text-[var(--error)]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Upload Section */}
        <CanvasSection
          title="Batch Upload"
          subtitle="Upload multiple images to auto-catalog"
        >
          <BatchUploader
            onFilesSelected={handleFilesSelected}
            isProcessing={isProcessing}
            progress={progress}
          />
        </CanvasSection>

        {/* Catalog Grid - Visual Spreadsheet Style */}
        {entries.length > 0 ? (
          <CanvasSection
            title={`Cataloged Images (${entries.length})`}
            subtitle="Click an entry to view details"
            actions={
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span>{totalTags} tags generated</span>
              </div>
            }
          >
            <div className="space-y-3">
              {entries.map(entry => (
                <div 
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`
                    cursor-pointer transition-all duration-[var(--motion-fast)]
                    ${selectedEntry?.id === entry.id 
                      ? "ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-root)]" 
                      : ""
                    }
                  `}
                >
                  <CatalogEntryCard
                    entry={entry}
                    onRemove={handleRemoveEntry}
                  />
                </div>
              ))}
            </div>
          </CanvasSection>
        ) : !isProcessing && (
          <CanvasEmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            title="Visual Spreadsheet"
            description="Upload images to automatically generate searchable tags, metadata, and SEO-ready descriptions"
            action={
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">Auto-tagging</span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">Color Analysis</span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">SEO Metadata</span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">Batch Export</span>
              </div>
            }
          />
        )}
      </div>

      {/* AI Activity Bar */}
      <AIActivityBar 
        status={aiStatus}
        message={
          error 
            ? error 
            : isProcessing 
              ? `Cataloging ${progress.current}/${progress.total}...` 
              : entries.length > 0 
                ? `${entries.length} images cataloged` 
                : undefined
        }
        onDismiss={error ? () => setError(null) : undefined}
      />
    </AppShell>
  );
}
