"use client";

import { useState, useCallback } from "react";
import AppShell, { CanvasSection, CanvasEmptyState, AIActivityBar } from "@/components/AppShell";
import InspectorPanel, { InspectorField, InspectorValue } from "@/components/InspectorPanel";
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

  // Build inspector sections
  const inspectorSections = productData ? [
    {
      id: "product",
      title: "Product Details",
      defaultOpen: true,
      children: (
        <div className="space-y-3">
          <InspectorField label="Product Name">
            <InspectorValue value={productData.product.name} />
          </InspectorField>
          <InspectorField label="Category">
            <InspectorValue value={productData.product.category} />
          </InspectorField>
          <InspectorField label="Current Color">
            <InspectorValue value={productData.product.current_color} />
          </InspectorField>
          <InspectorField label="Current Material">
            <InspectorValue value={productData.product.current_material} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "photography",
      title: "Photography",
      defaultOpen: true,
      children: (
        <div className="space-y-3">
          <InspectorField label="Background">
            <InspectorValue value={productData.photography.background_type} />
          </InspectorField>
          <InspectorField label="Lighting">
            <InspectorValue value={productData.photography.lighting_style} />
          </InspectorField>
          <InspectorField label="Angle">
            <InspectorValue value={productData.photography.angle} />
          </InspectorField>
          <InspectorField label="Shadows">
            <InspectorValue value={productData.photography.shadows} />
          </InspectorField>
        </div>
      ),
    },
    {
      id: "base-prompt",
      title: "Base Prompt",
      children: (
        <div className="space-y-2">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {productData.base_prompt}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(productData.base_prompt)}
            className="btn-ghost text-xs w-full justify-center"
          >
            Copy Base Prompt
          </button>
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
        productData ? (
          <InspectorPanel
            title="Product Inspector"
            subtitle="Analysis details"
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
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <CanvasSection 
              title="Product Image"
              subtitle="Upload a product photo to analyze"
            >
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image}
                isAnalyzing={analysisStatus === "analyzing"}
              />
            </CanvasSection>

            {/* Quick Stats Cards */}
            {productData && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div className="panel-elevated p-4">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Suggested Colors
                  </div>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {productData.suggested_variations.colors.length}
                  </div>
                </div>
                <div className="panel-elevated p-4">
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Materials
                  </div>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">
                    {productData.suggested_variations.materials.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Variations */}
          <div className="space-y-6">
            {productData ? (
              <CanvasSection
                title="Generate Variations"
                actions={
                  <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--glass-border)]">
                    <button
                      onClick={() => setVariationMode("combined")}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-medium 
                        transition-all duration-[var(--motion-fast)]
                        ${variationMode === "combined"
                          ? "bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }
                      `}
                    >
                      Combined
                    </button>
                    <button
                      onClick={() => setVariationMode("single")}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-medium 
                        transition-all duration-[var(--motion-fast)]
                        ${variationMode === "single"
                          ? "bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }
                      `}
                    >
                      Single
                    </button>
                  </div>
                }
              >
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
              </CanvasSection>
            ) : (
              <CanvasEmptyState
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                }
                title="Ready for Products"
                description="Upload a product photo to generate color, material, and background variations"
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
              ? "Analyzing product..." 
              : analysisStatus === "complete" 
                ? "Product analyzed" 
                : undefined
        }
        onDismiss={error ? () => setError(null) : undefined}
      />
    </AppShell>
  );
}
