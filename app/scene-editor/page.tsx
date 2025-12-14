"use client";

import { useState, useCallback, useRef } from "react";
import AppShell, { CanvasSection, CanvasEmptyState, AIActivityBar } from "@/components/AppShell";
import InspectorPanel, { InspectorField, InspectorValue, InspectorChips } from "@/components/InspectorPanel";
import ImageUploader from "@/components/ImageUploader";
import JsonViewer from "@/components/JsonViewer";
import SceneEditor from "@/components/SceneEditor";
import PromptOutput from "@/components/PromptOutput";
import GenerationPanel from "@/components/GenerationPanel";
import OutputComparison from "@/components/OutputComparison";
import VersionHistory from "@/components/VersionHistory";
import { 
  VisionStructOutput, 
  AnalysisStatus, 
  GenerationStatus, 
  GeneratedOutput, 
  GenerationResolution,
  VersionHistoryEntry 
} from "@/lib/types";
import { 
  renderReframedOutput, 
  cacheGeneratedOutput, 
  getCachedOutput,
  addToVersionHistory,
  createGenerationHistoryEntry,
  linkToSource 
} from "@/lib/generation";

export default function SceneEditorPage() {
  // Core state
  const [image, setImage] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [sceneData, setSceneData] = useState<VisionStructOutput | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generation state - "Render Reframed Output"
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle");
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedOutput | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [hasUserEdits, setHasUserEdits] = useState(false);
  const [versionHistory, setVersionHistory] = useState<VersionHistoryEntry[]>([]);
  
  // Track if activity bar was dismissed (to prevent re-showing on complete)
  const [activityDismissed, setActivityDismissed] = useState(false);
  
  // Track original scene data to detect edits
  const originalSceneDataRef = useRef<string | null>(null);
  const [originalSceneData, setOriginalSceneData] = useState<VisionStructOutput | null>(null);

  const handleImageSelect = useCallback(async (imageDataUrl: string) => {
    setImage(imageDataUrl);
    setSceneData(null);
    setGeneratedPrompt(null);
    setError(null);
    setAnalysisStatus("analyzing");
    setHasUserEdits(false);
    setGeneratedOutput(null);
    setGenerationStatus("idle");
    setActivityDismissed(false); // Reset dismissed state for new action
    originalSceneDataRef.current = null;

    // Add upload to history
    const uploadEntry: VersionHistoryEntry = {
      id: `upload_${Date.now()}`,
      type: "upload",
      timestamp: Date.now(),
      description: "Image uploaded",
    };
    setVersionHistory(prev => [uploadEntry, ...prev]);
    addToVersionHistory(uploadEntry);

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
      setOriginalSceneData(data.sceneData);
      setAnalysisStatus("complete");
      originalSceneDataRef.current = JSON.stringify(data.sceneData);

      // Add analysis to history
      const analysisEntry: VersionHistoryEntry = {
        id: `analysis_${Date.now()}`,
        type: "analysis",
        timestamp: Date.now(),
        description: "Scene analyzed",
        data: data.sceneData,
      };
      setVersionHistory(prev => [analysisEntry, ...prev]);
      addToVersionHistory(analysisEntry);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setAnalysisStatus("error");
    }
  }, []);

  const handleGeneratePrompt = useCallback(async (): Promise<string | null> => {
    if (!sceneData) return null;

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
      return data.prompt; // Return the prompt so caller can use it immediately
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [sceneData]);

  const handleSceneDataChange = useCallback((newData: VisionStructOutput) => {
    setSceneData(newData);
    setGeneratedPrompt(null);
    
    // Check if user has made edits by comparing to original
    if (originalSceneDataRef.current) {
      const hasChanges = JSON.stringify(newData) !== originalSceneDataRef.current;
      if (hasChanges && !hasUserEdits) {
        setHasUserEdits(true);
        // Add edit to history
        const editEntry: VersionHistoryEntry = {
          id: `edit_${Date.now()}`,
          type: "edit",
          timestamp: Date.now(),
          description: "Scene modified",
        };
        setVersionHistory(prev => [editEntry, ...prev]);
        addToVersionHistory(editEntry);
      }
    }
  }, [hasUserEdits]);

  // Handle "Render Reframed Output" - single click generates prompt + renders
  const handleRenderOutput = useCallback(async (options?: { resolution?: GenerationResolution }) => {
    if (!sceneData) return;

    // Get prompt - either use existing or generate new one
    let promptToUse = generatedPrompt;
    
    if (!promptToUse) {
      // Generate prompt first, wait for result
      const newPrompt = await handleGeneratePrompt();
      if (!newPrompt) {
        // Prompt generation failed, error already set
        return;
      }
      promptToUse = newPrompt;
    }

    // Check cache first
    const cached = getCachedOutput(sceneData, promptToUse);
    if (cached) {
      setGeneratedOutput(cached);
      setGenerationStatus("complete");
      return;
    }

    setGenerationStatus("generating");
    setGenerationError(null);
    setActivityDismissed(false); // Reset dismissed state for new render

    const result = await renderReframedOutput(
      sceneData,
      promptToUse,
      image || undefined,
      options
    );

    if (result.success && result.output) {
      // Link to source with full lineage
      const linkedOutput = linkToSource(
        result.output,
        `source_${Date.now()}`,
        sceneData
      );

      setGeneratedOutput(linkedOutput);
      setGenerationStatus("complete");

      // Cache the output
      cacheGeneratedOutput(sceneData, promptToUse, linkedOutput);

      // Add to history
      const genEntry = createGenerationHistoryEntry(linkedOutput);
      setVersionHistory(prev => [genEntry, ...prev]);
      addToVersionHistory(genEntry);

    } else {
      setGenerationError(result.error || "Render failed");
      setGenerationStatus("error");
    }
  }, [sceneData, generatedPrompt, image, handleGeneratePrompt]);

  // Handle accepting the generated output
  const handleAcceptOutput = useCallback(() => {
    // Keep the output, could trigger download or save
    setGenerationStatus("idle");
  }, []);

  // Handle discarding the generated output
  const handleDiscardOutput = useCallback(() => {
    setGeneratedOutput(null);
    setGenerationStatus("idle");
  }, []);

  // Handle regenerating
  const handleRegenerate = useCallback(() => {
    setGeneratedOutput(null);
    handleRenderOutput();
  }, [handleRenderOutput]);

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
    // Generation section in inspector
    {
      id: "synthesis",
      title: "Synthesis",
      defaultOpen: generationStatus !== "idle" || hasUserEdits,
      children: (
        <GenerationPanel
          hasUserEdits={hasUserEdits}
          hasSceneData={!!sceneData}
          status={generationStatus}
          error={generationError}
          onRender={handleRenderOutput}
          onDismissError={() => setGenerationError(null)}
        />
      ),
    },
    // Version history section
    {
      id: "history",
      title: "History",
      children: (
        <VersionHistory
          entries={versionHistory}
          onClear={() => setVersionHistory([])}
        />
      ),
    },
  ] : [];

  // Determine AI activity status
  const isProcessing = analysisStatus === "analyzing" || isGenerating || generationStatus === "generating";
  const hasError = !!(error || generationError);
  const isComplete = (analysisStatus === "complete" || generationStatus === "complete") && !activityDismissed;
  
  const aiStatus = isProcessing
    ? "processing" 
    : hasError
      ? "error" 
      : isComplete
        ? "complete" 
        : "idle";

  const aiMessage = hasError
    ? error || generationError
    : analysisStatus === "analyzing" 
      ? "Analyzing scene..." 
      : isGenerating 
        ? "Generating prompt..." 
        : generationStatus === "generating"
          ? "Rendering reframed output..."
          : generationStatus === "complete" && !activityDismissed
            ? "Output ready for comparison"
            : analysisStatus === "complete" && !activityDismissed
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
        {(error || generationError) && (
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
            <span className="text-sm">{error || generationError}</span>
            <button 
              onClick={() => {
                setError(null);
                setGenerationError(null);
              }}
              className="ml-auto text-[var(--error)]/60 hover:text-[var(--error)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Output Comparison - Shows when generation is complete */}
        {generatedOutput && image && (
          <div className="animate-fade-in">
            <CanvasSection
              title="Output Comparison"
              subtitle="Compare original with reframed result"
            >
              <OutputComparison
                sourceImage={image}
                generatedOutput={generatedOutput}
                sceneData={sceneData || undefined}
                onAccept={handleAcceptOutput}
                onDiscard={handleDiscardOutput}
                onRegenerate={handleRegenerate}
              />
            </CanvasSection>
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

            {/* Prompt Output */}
            <CanvasSection>
                  <PromptOutput
                    prompt={generatedPrompt}
                    isGenerating={isGenerating}
                    onGenerate={handleGeneratePrompt}
                    hasSceneData={!!sceneData}
                  />
                </CanvasSection>
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
                    <SceneEditor 
                      data={sceneData} 
                      onChange={handleSceneDataChange}
                      originalData={originalSceneData || undefined}
                      isRendering={generationStatus === "generating"}
                    />
                  </div>
                </CanvasSection>

                {/* Prompt Output */}
                {/* <CanvasSection>
                  <PromptOutput
                    prompt={generatedPrompt}
                    isGenerating={isGenerating}
                    onGenerate={handleGeneratePrompt}
                    hasSceneData={!!sceneData}
                  />
                </CanvasSection> */}

                {/* Inline Generation Panel (alternative placement) */}
                {!generatedOutput && (
                  <CanvasSection
                    title="Render Output"
                    subtitle="Synthesize from scene understanding"
                  >
                    <GenerationPanel
                      hasUserEdits={hasUserEdits}
                      hasSceneData={!!sceneData}
                      status={generationStatus}
                      error={generationError}
                      onRender={handleRenderOutput}
                      onDismissError={() => setGenerationError(null)}
                    />
                  </CanvasSection>
                )}
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
        message={aiMessage ?? undefined}
        onDismiss={() => {
          setError(null);
          setGenerationError(null);
          setActivityDismissed(true); // Prevent bar from re-showing
        }}
        autoClose={(aiStatus === "complete" || aiStatus === "error") ? 4000 : undefined}
      />
    </AppShell>
  );
}
