"use client";

import { useState, useCallback } from "react";
import AppShell, { CanvasSection, CanvasEmptyState, AIActivityBar } from "@/components/AppShell";
import InspectorPanel, { InspectorField, InspectorValue, InspectorChips } from "@/components/InspectorPanel";
import ImageUploader from "@/components/ImageUploader";
import JsonViewer from "@/components/JsonViewer";
import SceneEditor from "@/components/SceneEditor";
import PromptOutput from "@/components/PromptOutput";
import { VisionStructOutput, AnalysisStatus } from "@/lib/types";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [sceneData, setSceneData] = useState<VisionStructOutput | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageSelect = useCallback(async (imageDataUrl: string) => {
    setImage(imageDataUrl);
    setSceneData(null);
    setGeneratedPrompt(null);
    setError(null);
    setAnalysisStatus("analyzing");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setSceneData(data.sceneData);
      setAnalysisStatus("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setAnalysisStatus("error");
    }
  }, []);

  const handleGeneratePrompt = useCallback(async () => {
    if (!sceneData) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [sceneData]);

  const handleSceneDataChange = useCallback((newData: VisionStructOutput) => {
    setSceneData(newData);
    setGeneratedPrompt(null);
  }, []);

  // Build inspector sections based on current state
  const inspectorSections = sceneData ? [
    {
      id: "overview",
      title: "Scene Overview",
      defaultOpen: true,
      children: (
        <div className="space-y-3">
          <InspectorField label="Description">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {sceneData.global_context.scene_description}
            </p>
          </InspectorField>
          <InspectorField label="Time of Day">
            <InspectorValue value={sceneData.global_context.time_of_day} />
          </InspectorField>
          <InspectorField label="Atmosphere">
            <InspectorValue value={sceneData.global_context.weather_atmosphere} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "lighting",
      title: "Lighting",
      defaultOpen: true,
      children: (
        <div className="grid grid-cols-2 gap-3">
          <InspectorField label="Source">
            <InspectorValue value={sceneData.global_context.lighting.source} />
          </InspectorField>
          <InspectorField label="Direction">
            <InspectorValue value={sceneData.global_context.lighting.direction} />
          </InspectorField>
          <InspectorField label="Quality">
            <InspectorValue value={sceneData.global_context.lighting.quality} />
          </InspectorField>
          <InspectorField label="Temperature">
            <InspectorValue value={sceneData.global_context.lighting.color_temp} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "colors",
      title: "Color Palette",
      children: (
        <div className="space-y-3">
          <div className="flex gap-2">
            {sceneData.color_palette.dominant_hex_estimates.slice(0, 5).map((color, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-lg border border-[var(--glass-border)]"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <InspectorField label="Contrast">
            <InspectorValue value={sceneData.color_palette.contrast_level} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "objects",
      title: `Objects (${sceneData.objects.length})`,
      children: (
        <InspectorChips items={sceneData.objects.map(obj => obj.label)} />
      ),
    },
  ] : [];

  // Determine AI activity status
  const aiStatus = analysisStatus === "analyzing" || isGenerating 
    ? "processing" 
    : error 
      ? "error" 
      : analysisStatus === "complete" 
        ? "complete" 
        : "idle";

  const aiMessage = error 
    ? error 
    : analysisStatus === "analyzing" 
      ? "Analyzing scene..." 
      : isGenerating 
        ? "Generating prompt..." 
        : analysisStatus === "complete" 
          ? "Analysis complete" 
          : undefined;

  return (
    <AppShell
      inspector={
        sceneData ? (
          <InspectorPanel
            title="Scene Inspector"
            subtitle="Quick overview of detected elements"
            sections={inspectorSections}
          />
        ) : undefined
      }
    >
      {/* Visual Canvas Content */}
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
          {/* Left Column - Image Upload & Preview */}
          <div className="space-y-6">
            <CanvasSection 
              title="Source Image"
              subtitle="Upload an image to analyze"
            >
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                isAnalyzing={analysisStatus === "analyzing"}
              />
            </CanvasSection>

            {/* JSON Viewer */}
            {sceneData && (
              <div className="animate-fade-in">
                <JsonViewer data={sceneData} />
              </div>
            )}
          </div>

          {/* Right Column - Editor & Output */}
          <div className="space-y-6">
            {sceneData ? (
              <>
                {/* Scene Editor */}
                <CanvasSection
                  title="Scene Editor"
                  subtitle="Modify visual attributes"
                >
                  <div className="max-h-[500px] overflow-y-auto pr-2 -mr-2">
                    <SceneEditor data={sceneData} onChange={handleSceneDataChange} />
                  </div>
                </CanvasSection>

                {/* Prompt Output */}
                <CanvasSection>
                  <PromptOutput
                    prompt={generatedPrompt}
                    isGenerating={isGenerating}
                    onGenerate={handleGeneratePrompt}
                    hasSceneData={!!sceneData}
                  />
                </CanvasSection>
              </>
            ) : (
              <CanvasEmptyState
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                }
                title="Ready to Reframe"
                description="Upload an image to analyze its visual elements and create editable scene blueprints"
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Activity Bar */}
      <AIActivityBar 
        status={aiStatus}
        message={aiMessage}
        onDismiss={aiStatus === "complete" || aiStatus === "error" ? () => setError(null) : undefined}
      />
    </AppShell>
  );
}
