"use client";

import { useState, useCallback } from "react";
import AppShell, { CanvasSection, CanvasEmptyState, AIActivityBar } from "@/components/AppShell";
import InspectorPanel, { InspectorField, InspectorValue, InspectorChips, InspectorColor } from "@/components/InspectorPanel";
import ImageUploader from "@/components/ImageUploader";
import VisualDNADisplay from "@/components/VisualDNADisplay";
import RemixBuilder from "@/components/RemixBuilder";
import StyleTransfer from "@/components/StyleTransfer";
import { VisualDNA, RemixResult } from "@/lib/remix-prompts";

type AnalysisStatus = "idle" | "analyzing" | "complete" | "error";
type RemixMode = "concepts" | "transfer";

export default function RemixPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [visualDNA, setVisualDNA] = useState<VisualDNA | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remixMode, setRemixMode] = useState<RemixMode>("concepts");

  const handleImageSelect = useCallback(async (imageDataUrl: string) => {
    setImage(imageDataUrl);
    setVisualDNA(null);
    setError(null);
    setAnalysisStatus("analyzing");

    try {
      const response = await fetch("/api/remix/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      setVisualDNA(data.visualDNA);
      setAnalysisStatus("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
      setAnalysisStatus("error");
    }
  }, []);

  const handleGenerateRemix = useCallback(async (params: {
    newConcept: string;
    styleModifier?: string;
    customElements: {
      keepColors: boolean;
      keepLighting: boolean;
      keepComposition: boolean;
      keepMood: boolean;
      keepTextures: boolean;
    };
  }): Promise<RemixResult | null> => {
    if (!visualDNA) return null;

    try {
      const response = await fetch("/api/remix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visualDNA,
          newConcept: params.newConcept,
          styleModifier: params.styleModifier,
          customElements: params.customElements,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      return data.remixResult;
    } catch (err) {
      console.error("Remix generation error:", err);
      return null;
    }
  }, [visualDNA]);

  // Build inspector sections - Visual DNA Lab style
  const inspectorSections = visualDNA ? [
    {
      id: "style",
      title: "Style Signature",
      defaultOpen: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      children: (
        <div className="space-y-3">
          <InspectorField label="Primary Style">
            <InspectorValue value={visualDNA.visual_dna.style_mood.primary_style || "Contemporary"} />
          </InspectorField>
          <InspectorField label="Era Influence">
            <InspectorValue value={visualDNA.visual_dna.style_mood.era_influence || "Modern"} />
          </InspectorField>
          <InspectorField label="Descriptors">
            <InspectorChips items={visualDNA.visual_dna.style_mood.descriptors || []} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "mood",
      title: "Mood & Atmosphere",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      children: (
        <div className="space-y-3">
          <InspectorField label="Mood">
            <InspectorValue value={visualDNA.visual_dna.style_mood.mood} />
          </InspectorField>
          <InspectorField label="Contrast">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
                  style={{ 
                    width: visualDNA.visual_dna.color_theory.contrast === "High" ? "100%" 
                         : visualDNA.visual_dna.color_theory.contrast === "Medium" ? "60%" 
                         : "30%" 
                  }}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)] capitalize">{visualDNA.visual_dna.color_theory.contrast.toLowerCase()}</span>
            </div>
          </InspectorField>
          <InspectorField label="Descriptors">
            <InspectorChips items={visualDNA.visual_dna.style_mood.descriptors || []} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "colors",
      title: "Color DNA",
      children: (
        <div className="space-y-3">
          <InspectorField label="Palette">
            <div className="flex gap-1">
              {visualDNA.visual_dna.color_theory.dominant_colors.slice(0, 5).map((color, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 rounded border border-[var(--glass-border)]"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </InspectorField>
          <InspectorField label="Harmony">
            <InspectorValue value={visualDNA.visual_dna.color_theory.palette_type || "Complementary"} />
          </InspectorField>
          <InspectorField label="Temperature">
            <InspectorValue value={visualDNA.visual_dna.color_theory.temperature || "Neutral"} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "composition",
      title: "Composition",
      children: (
        <div className="space-y-3">
          <InspectorField label="Layout">
            <InspectorValue value={visualDNA.visual_dna.composition.layout || "Balanced"} />
          </InspectorField>
          <InspectorField label="Balance">
            <InspectorValue value={visualDNA.visual_dna.composition.balance || "Dynamic"} />
          </InspectorField>
        </div>
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
        visualDNA ? (
          <InspectorPanel
            title="Visual DNA"
            subtitle="Extracted style elements"
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
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          {/* Left Column - Reference Image & DNA */}
          <div className="space-y-6">
            <CanvasSection 
              title="Reference Image"
              subtitle="Upload an image with a style to extract"
            >
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                isAnalyzing={analysisStatus === "analyzing"}
              />
            </CanvasSection>

            {/* Visual DNA Display - Lab aesthetic */}
            {visualDNA && (
              <CanvasSection
                title="Extracted Visual DNA"
                subtitle="Style signature from reference"
                className="animate-fade-in"
              >
                <div className="max-h-[500px] overflow-y-auto pr-2 -mr-2">
                  <VisualDNADisplay data={visualDNA} />
                </div>
              </CanvasSection>
            )}
          </div>

          {/* Right Column - Remix Builder */}
          <div className="space-y-6">
            {visualDNA ? (
              <CanvasSection
                title={remixMode === "concepts" ? "Remix Builder" : "Style Transfer"}
                subtitle={remixMode === "concepts" 
                  ? "Apply extracted DNA to new concepts" 
                  : "Transfer style to another image"
                }
                actions={
                  <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--glass-border)]">
                    <button
                      onClick={() => setRemixMode("concepts")}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-medium 
                        transition-all duration-[var(--motion-fast)]
                        ${remixMode === "concepts"
                          ? "bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }
                      `}
                    >
                      New Concepts
                    </button>
                    <button
                      onClick={() => setRemixMode("transfer")}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-medium 
                        transition-all duration-[var(--motion-fast)]
                        ${remixMode === "transfer"
                          ? "bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }
                      `}
                    >
                      Style Transfer
                    </button>
                  </div>
                }
                className="animate-fade-in"
              >
                {remixMode === "concepts" ? (
                  <RemixBuilder
                    visualDNA={visualDNA}
                    onGenerate={handleGenerateRemix}
                  />
                ) : (
                  <StyleTransfer visualDNA={visualDNA} />
                )}
              </CanvasSection>
            ) : (
              <CanvasEmptyState
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                }
                title="Visual DNA Lab"
                description="Upload a reference image to extract its visual DNA and apply the style to new concepts"
                action={
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">Style & Mood</span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">Color Theory</span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">Lighting</span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">Composition</span>
                  </div>
                }
              />
            )}
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
              ? "Extracting visual DNA..." 
              : analysisStatus === "complete" 
                ? "DNA extracted successfully" 
                : undefined
        }
        onDismiss={error ? () => setError(null) : undefined}
      />
    </AppShell>
  );
}
