"use client";

import { useState, useCallback } from "react";
import AppShell, { CanvasSection, AIActivityBar } from "@/components/AppShell";
import InspectorPanel, { InspectorField, InspectorValue } from "@/components/InspectorPanel";
import ImageUploader from "@/components/ImageUploader";
import AccessibilityOutput from "@/components/AccessibilityOutput";
import { AccessibilityOutput as AccessibilityData } from "@/lib/accessibility-prompts";

type AnalysisStatus = "idle" | "analyzing" | "complete" | "error";
type ViewMode = "screen-reader" | "seo" | "low-vision";

const viewModes: { id: ViewMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "screen-reader",
    label: "Screen Reader",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    ),
    description: "How visually impaired users experience the image",
  },
  {
    id: "seo",
    label: "SEO Crawler",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    description: "How search engines index the image",
  },
  {
    id: "low-vision",
    label: "Low Vision",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    description: "For users with partial vision loss",
  },
];

export default function AccessibilityPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [accessibilityData, setAccessibilityData] = useState<AccessibilityData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("screen-reader");

  const handleImageSelect = useCallback(async (imageDataUrl: string) => {
    setImage(imageDataUrl);
    setAccessibilityData(null);
    setError(null);
    setAnalysisStatus("analyzing");

    try {
      const response = await fetch("/api/accessibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAccessibilityData(data.accessibilityData);
      setAnalysisStatus("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setAnalysisStatus("error");
    }
  }, []);

  // Build inspector sections
  const inspectorSections = accessibilityData ? [
    {
      id: "stats",
      title: "Quick Stats",
      defaultOpen: true,
      children: (
        <div className="space-y-3">
          <InspectorField label="Alt Text Length">
            <InspectorValue value={`${accessibilityData.short_alt.length} characters`} />
          </InspectorField>
          <InspectorField label="Detected Text">
            <InspectorValue value={`${accessibilityData.detected_text?.length || 0} items`} />
          </InspectorField>
          <InspectorField label="Warnings">
            <InspectorValue value={`${accessibilityData.content_warnings?.length || 0} found`} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "context",
      title: "Suggested Context",
      children: (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {accessibilityData.suggested_context || "No additional context suggested"}
        </p>
      ),
    },
  ] : [];

  const aiStatus = analysisStatus === "analyzing" 
    ? "processing" 
    : error 
      ? "error" 
      : analysisStatus === "complete" 
        ? "complete" 
        : "idle";

  return (
    <AppShell
      inspector={
        accessibilityData ? (
          <InspectorPanel
            title="Accessibility Info"
            subtitle="Analysis summary"
            sections={inspectorSections}
          />
        ) : undefined
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
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-[var(--error)]/60 hover:text-[var(--error)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <CanvasSection 
              title="Source Image"
              subtitle="Upload an image for accessibility analysis"
            >
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                isAnalyzing={analysisStatus === "analyzing"}
              />
            </CanvasSection>

            {/* Quick Stats Cards */}
            {accessibilityData && (
              <div className="grid grid-cols-3 gap-4 animate-fade-in">
                <div className="panel-elevated p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {accessibilityData.short_alt.length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Alt chars</div>
                </div>
                <div className="panel-elevated p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {accessibilityData.detected_text?.length || 0}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Text found</div>
                </div>
                <div className="panel-elevated p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {accessibilityData.content_warnings?.length || 0}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Warnings</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Accessibility Output */}
          <div className="space-y-6">
            {/* Experience As... Toggle */}
            <CanvasSection
              title="Experience as..."
              subtitle="See how different users perceive this image"
            >
              <div className="flex flex-col gap-2">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl text-left
                      transition-all duration-[var(--motion-fast)]
                      ${viewMode === mode.id 
                        ? "bg-[var(--accent-soft)] border border-[var(--accent-primary)]/30" 
                        : "bg-[var(--bg-surface)] border border-[var(--glass-border)] hover:border-[var(--text-muted)]/30"
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${viewMode === mode.id 
                        ? "bg-[var(--accent-primary)] text-white" 
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                      }
                    `}>
                      {mode.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        viewMode === mode.id ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"
                      }`}>
                        {mode.label}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{mode.description}</p>
                    </div>
                    {viewMode === mode.id && (
                      <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </CanvasSection>

            {/* Generated Descriptions */}
            <CanvasSection
              title="Generated Descriptions"
              subtitle={`Optimized for ${viewModes.find(m => m.id === viewMode)?.label}`}
            >
              <AccessibilityOutput 
                data={accessibilityData} 
                isAnalyzing={analysisStatus === "analyzing"}
                viewMode={viewMode}
              />
            </CanvasSection>
          </div>
        </div>
      </div>

      {/* AI Activity Bar */}
      <AIActivityBar 
        status={aiStatus}
        message={
          error 
            ? error 
            : analysisStatus === "analyzing" 
              ? "Generating accessibility descriptions..." 
              : analysisStatus === "complete" 
                ? "Descriptions ready" 
                : undefined
        }
        onDismiss={error ? () => setError(null) : undefined}
      />
    </AppShell>
  );
}
