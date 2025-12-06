"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
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

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Creative Remix</h2>
              <p className="text-sm text-zinc-500">Extract visual DNA and apply it to new concepts</p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fade-in">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          {/* Left Column - Reference Image & DNA */}
          <div className="space-y-6">
            <div className="panel rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reference Image
              </h3>
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                isAnalyzing={analysisStatus === "analyzing"}
              />
              <p className="text-xs text-zinc-500 mt-3 text-center">
                Upload an image with a style you want to extract and remix
              </p>
            </div>

            {/* Visual DNA Display */}
            {visualDNA && (
              <div className="panel rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Extracted Visual DNA
                </h3>
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  <VisualDNADisplay data={visualDNA} />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Remix Builder */}
          <div className="space-y-6">
            {visualDNA ? (
              <div className="panel rounded-2xl p-6 animate-fade-in">
                {/* Mode Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {remixMode === "concepts" ? "Remix Builder" : "Style Transfer"}
                  </h3>
                  <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <button
                      onClick={() => setRemixMode("concepts")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        remixMode === "concepts"
                          ? "bg-pink-500/20 text-pink-400"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      💡 New Concepts
                    </button>
                    <button
                      onClick={() => setRemixMode("transfer")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        remixMode === "transfer"
                          ? "bg-rose-500/20 text-rose-400"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      🔄 Style Transfer
                    </button>
                  </div>
                </div>

                {/* Mode Content */}
                {remixMode === "concepts" ? (
                  <RemixBuilder
                    visualDNA={visualDNA}
                    onGenerate={handleGenerateRemix}
                  />
                ) : (
                  <StyleTransfer visualDNA={visualDNA} />
                )}
              </div>
            ) : (
              <div className="panel rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Ready to Remix</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Upload a reference image to extract its visual DNA and apply the style to new concepts
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">Style & Mood</span>
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">Color Theory</span>
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">Lighting</span>
                  <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">Composition</span>
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

