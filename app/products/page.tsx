"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import ProductVariations from "@/components/ProductVariations";
import CombinedVariationBuilder from "@/components/CombinedVariationBuilder";
import { ProductAnalysis, VariationRequest, VariationResult } from "@/lib/product-prompts";

type AnalysisStatus = "idle" | "analyzing" | "complete" | "error";
type VariationMode = "single" | "combined";

export default function ProductsPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [productData, setProductData] = useState<ProductAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variationMode, setVariationMode] = useState<VariationMode>("combined");

  const handleImageSelect = useCallback(async (imageDataUrl: string) => {
    setImage(imageDataUrl);
    setProductData(null);
    setError(null);
    setAnalysisStatus("analyzing");

    try {
      const response = await fetch("/api/products/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setProductData(data.productData);
      setAnalysisStatus("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setAnalysisStatus("error");
    }
  }, []);

  const handleGenerateVariation = useCallback(async (variation: VariationRequest): Promise<VariationResult | null> => {
    if (!productData) return null;

    try {
      const response = await fetch("/api/products/variation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productData, variation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      return data.variationResult;
    } catch (err) {
      console.error("Variation generation error:", err);
      return null;
    }
  }, [productData]);

  const handleGenerateCombined = useCallback(async (variations: { color?: string; material?: string; background?: string }): Promise<VariationResult | null> => {
    if (!productData) return null;

    try {
      const response = await fetch("/api/products/combined", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productData, variations }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      return data.variationResult;
    } catch (err) {
      console.error("Combined variation error:", err);
      return null;
    }
  }, [productData]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Product Variations</h2>
              <p className="text-sm text-zinc-500">Generate color, material, and background variations for e-commerce</p>
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
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <div className="panel rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Product Image
              </h3>
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                isAnalyzing={analysisStatus === "analyzing"}
              />
            </div>

            {/* Base Prompt */}
            {productData && (
              <div className="panel rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Base Prompt
                </h3>
                <div className="rounded-xl bg-zinc-800/50 p-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {productData.base_prompt}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(productData.base_prompt)}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors text-xs text-zinc-300"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Base Prompt
                  </button>
                </div>
              </div>
            )}

            {/* Photography Details */}
            {productData && (
              <div className="panel rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Photography Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Background</span>
                    <p className="text-sm text-zinc-300 mt-1">{productData.photography.background_type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Lighting</span>
                    <p className="text-sm text-zinc-300 mt-1">{productData.photography.lighting_style}</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Angle</span>
                    <p className="text-sm text-zinc-300 mt-1">{productData.photography.angle}</p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Shadows</span>
                    <p className="text-sm text-zinc-300 mt-1">{productData.photography.shadows}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Variations */}
          <div className="space-y-6">
            {productData ? (
              <div className="panel rounded-2xl p-6 animate-fade-in">
                {/* Mode Toggle */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Generate Variations
                  </h3>
                  <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <button
                      onClick={() => setVariationMode("combined")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        variationMode === "combined"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      🎯 Combined
                    </button>
                    <button
                      onClick={() => setVariationMode("single")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        variationMode === "single"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      📝 Single
                    </button>
                  </div>
                </div>

                {/* Mode Content */}
                {variationMode === "combined" ? (
                  <CombinedVariationBuilder
                    productData={productData}
                    onGenerateCombined={handleGenerateCombined}
                  />
                ) : (
                  <ProductVariations
                    productData={productData}
                    onGenerateVariation={handleGenerateVariation}
                  />
                )}
              </div>
            ) : (
              <div className="panel rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Ready for Products</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Upload a product photo to analyze and generate color, material, and background variations
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

