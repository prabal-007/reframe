"use client";

import { useState, useCallback } from "react";
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
    // Clear generated prompt when data changes so user regenerates
    setGeneratedPrompt(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Reframe</h1>
                <p className="text-xs text-zinc-500">Visual Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                POC v0.1
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400/60 hover:text-red-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image Upload & Preview */}
          <div className="space-y-6">
            <div className="panel rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Source Image
              </h2>
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                isAnalyzing={analysisStatus === "analyzing"}
              />
            </div>

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
                <div className="panel rounded-2xl p-6 animate-fade-in">
                  <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Scene Editor
                  </h2>
                  <div className="max-h-[600px] overflow-y-auto pr-2">
                    <SceneEditor data={sceneData} onChange={handleSceneDataChange} />
                  </div>
                </div>

                {/* Prompt Output */}
                <div className="panel rounded-2xl p-6 animate-fade-in">
                  <PromptOutput
                    prompt={generatedPrompt}
                    isGenerating={isGenerating}
                    onGenerate={handleGeneratePrompt}
                    hasSceneData={!!sceneData}
                  />
                </div>
              </>
            ) : (
              <div className="panel rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Ready to Reframe</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Upload an image to analyze its visual elements and create editable scene blueprints
                </p>
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
