"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import BatchUploader from "@/components/BatchUploader";
import CatalogEntryCard from "@/components/CatalogEntryCard";
import { CatalogEntry, formatForExport, ExportFormat } from "@/lib/catalog-prompts";

export default function CatalogPage() {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

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
  }, []);

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
    }
  }, []);

  const totalTags = entries.reduce((sum, e) => 
    sum + e.metadata.tags.primary.length + e.metadata.tags.secondary.length, 0
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Image Catalog</h2>
              <p className="text-sm text-zinc-500">Auto-tag and create searchable metadata for your images</p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Upload */}
          <div className="lg:col-span-1 space-y-6">
            <div className="panel rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Images
              </h3>
              <BatchUploader
                onFilesSelected={handleFilesSelected}
                isProcessing={isProcessing}
                progress={progress}
              />
            </div>

            {/* Stats */}
            {entries.length > 0 && (
              <div className="panel rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
                    <div className="text-2xl font-bold text-zinc-100">{entries.length}</div>
                    <div className="text-xs text-zinc-500 mt-1">Images</div>
                  </div>
                  <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
                    <div className="text-2xl font-bold text-zinc-100">{totalTags}</div>
                    <div className="text-xs text-zinc-500 mt-1">Tags</div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Options */}
            {entries.length > 0 && (
              <div className="panel rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleExport("json")}
                    className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">JSON</span>
                    Full Metadata
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">CSV</span>
                    Spreadsheet
                  </button>
                  <button
                    onClick={() => handleExport("keywords")}
                    className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">TXT</span>
                    Keywords Only
                  </button>
                </div>
                <button
                  onClick={handleClearAll}
                  className="w-full mt-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                >
                  Clear All Entries
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Catalog Entries */}
          <div className="lg:col-span-2 space-y-4">
            {entries.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-100">
                    Cataloged Images ({entries.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {entries.map(entry => (
                    <CatalogEntryCard
                      key={entry.id}
                      entry={entry}
                      onRemove={handleRemoveEntry}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="panel rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">No Images Cataloged</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Upload images to automatically generate searchable tags, metadata, and SEO-ready descriptions
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">Auto-tagging</span>
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">Color Analysis</span>
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">SEO Metadata</span>
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">Batch Export</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <p>Reframe © 2024 • Visual Intelligence Platform</p>
            <p>Powered by Google Gemini</p>
          </div>
        </div>
      </footer>
    </div>
  );
}










