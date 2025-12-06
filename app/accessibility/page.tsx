"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import AccessibilityOutput from "@/components/AccessibilityOutput";
import { AccessibilityOutput as AccessibilityData } from "@/lib/accessibility-prompts";

type AnalysisStatus = "idle" | "analyzing" | "complete" | "error";

export default function AccessibilityPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [accessibilityData, setAccessibilityData] = useState<AccessibilityData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Accessibility Tool</h2>
              <p className="text-sm text-zinc-500">Generate alt-text and audio descriptions for visually impaired users</p>
            </div>
          </div>
        </div>

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
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <div className="panel rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Source Image
              </h3>
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                isAnalyzing={analysisStatus === "analyzing"}
              />
            </div>

            {/* Quick Stats */}
            {accessibilityData && (
              <div className="grid grid-cols-3 gap-4 animate-fade-in">
                <div className="panel rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-zinc-100">
                    {accessibilityData.short_alt.length}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Alt chars</div>
                </div>
                <div className="panel rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-zinc-100">
                    {accessibilityData.detected_text?.length || 0}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Text found</div>
                </div>
                <div className="panel rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-zinc-100">
                    {accessibilityData.content_warnings?.length || 0}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Warnings</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Accessibility Output */}
          <div className="space-y-6">
            <div className="panel rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generated Descriptions
              </h3>
              <AccessibilityOutput 
                data={accessibilityData} 
                isAnalyzing={analysisStatus === "analyzing"} 
              />
            </div>
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

