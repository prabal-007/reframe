"use client";

import { useState, useCallback } from "react";
import { 
  ProductAnalysis, 
  VariationResult,
  COLOR_PALETTES, 
  BACKGROUND_PRESETS, 
  MATERIAL_OPTIONS 
} from "@/lib/product-prompts";

interface CombinedVariationBuilderProps {
  productData: ProductAnalysis;
  onGenerateCombined: (variations: { color?: string; material?: string; background?: string }) => Promise<VariationResult | null>;
}

interface CombinedVariation {
  id: string;
  color?: string;
  material?: string;
  background?: string;
  result?: VariationResult;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-xs text-zinc-400 hover:text-zinc-200"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// Get all colors as flat array
const getAllColors = () => {
  const colors: string[] = [];
  Object.values(COLOR_PALETTES).forEach(palette => {
    palette.forEach(color => {
      if (!colors.includes(color)) colors.push(color);
    });
  });
  return colors;
};

export default function CombinedVariationBuilder({ productData, onGenerateCombined }: CombinedVariationBuilderProps) {
  const [variations, setVariations] = useState<CombinedVariation[]>([
    { id: "1", color: undefined, material: undefined, background: undefined }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const allColors = getAllColors();

  const updateVariation = useCallback((id: string, field: "color" | "material" | "background", value: string | undefined) => {
    setVariations(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value, result: undefined } : v
    ));
  }, []);

  const addVariation = useCallback(() => {
    setVariations(prev => [
      ...prev,
      { id: Date.now().toString(), color: undefined, material: undefined, background: undefined }
    ]);
  }, []);

  const removeVariation = useCallback((id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id));
  }, []);

  const duplicateVariation = useCallback((variation: CombinedVariation) => {
    setVariations(prev => [
      ...prev,
      { ...variation, id: Date.now().toString(), result: undefined }
    ]);
  }, []);

  const generateSingle = useCallback(async (id: string) => {
    const variation = variations.find(v => v.id === id);
    if (!variation || (!variation.color && !variation.material && !variation.background)) return;

    setGeneratingId(id);
    const result = await onGenerateCombined({
      color: variation.color,
      material: variation.material,
      background: variation.background,
    });

    if (result) {
      setVariations(prev => prev.map(v => 
        v.id === id ? { ...v, result } : v
      ));
    }
    setGeneratingId(null);
  }, [variations, onGenerateCombined]);

  const generateAll = useCallback(async () => {
    const pendingVariations = variations.filter(v => 
      !v.result && (v.color || v.material || v.background)
    );
    
    if (pendingVariations.length === 0) return;

    setIsGenerating(true);
    
    for (const variation of pendingVariations) {
      setGeneratingId(variation.id);
      const result = await onGenerateCombined({
        color: variation.color,
        material: variation.material,
        background: variation.background,
      });

      if (result) {
        setVariations(prev => prev.map(v => 
          v.id === variation.id ? { ...v, result } : v
        ));
      }
    }
    
    setGeneratingId(null);
    setIsGenerating(false);
  }, [variations, onGenerateCombined]);

  const getVariationLabel = (v: CombinedVariation) => {
    const parts = [];
    if (v.color) parts.push(v.color);
    if (v.material) parts.push(v.material);
    if (v.background) parts.push(BACKGROUND_PRESETS.find(b => b.value === v.background)?.name || "Custom BG");
    return parts.length > 0 ? parts.join(" + ") : "Empty variation";
  };

  const pendingCount = variations.filter(v => !v.result && (v.color || v.material || v.background)).length;
  const completedCount = variations.filter(v => v.result).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Combined Variation Builder
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            Mix color + material + background in a single prompt
          </p>
        </div>
        <button
          onClick={addVariation}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm text-zinc-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Variation
        </button>
      </div>

      {/* Variations List */}
      <div className="space-y-4">
        {variations.map((variation, index) => (
          <div 
            key={variation.id}
            className={`rounded-2xl border overflow-hidden transition-all ${
              variation.result 
                ? "bg-green-500/5 border-green-500/20" 
                : "bg-zinc-900/50 border-zinc-800"
            }`}
          >
            {/* Variation Header */}
            <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {getVariationLabel(variation)}
                </span>
                {variation.result && (
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                    ✓ Generated
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => duplicateVariation(variation)}
                  className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Duplicate"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                {variations.length > 1 && (
                  <button
                    onClick={() => removeVariation(variation.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Selection Grid */}
            <div className="p-4 grid md:grid-cols-3 gap-4">
              {/* Color Selector */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  🎨 Color
                </label>
                <select
                  value={variation.color || ""}
                  onChange={(e) => updateVariation(variation.id, "color", e.target.value || undefined)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="">Keep original</option>
                  <optgroup label="Neutrals">
                    {COLOR_PALETTES.neutrals.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Vibrant">
                    {COLOR_PALETTES.vibrant.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Pastels">
                    {COLOR_PALETTES.pastels.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Earth Tones">
                    {COLOR_PALETTES.earth.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Metallics">
                    {COLOR_PALETTES.metallics.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="AI Suggested">
                    {productData.suggested_variations.colors.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Material Selector */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  ✨ Material
                </label>
                <select
                  value={variation.material || ""}
                  onChange={(e) => updateVariation(variation.id, "material", e.target.value || undefined)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="">Keep original</option>
                  {MATERIAL_OPTIONS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <optgroup label="AI Suggested">
                    {productData.suggested_variations.materials.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Background Selector */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  🖼️ Background
                </label>
                <select
                  value={variation.background || ""}
                  onChange={(e) => updateVariation(variation.id, "background", e.target.value || undefined)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="">Keep original</option>
                  {BACKGROUND_PRESETS.map(bg => (
                    <option key={bg.name} value={bg.value}>{bg.name}</option>
                  ))}
                  <optgroup label="AI Suggested">
                    {productData.suggested_variations.backgrounds.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Generate Button / Result */}
            <div className="px-4 pb-4">
              {variation.result ? (
                <div className="rounded-xl bg-zinc-800/50 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-zinc-500">Generated Prompt</span>
                    <CopyButton text={variation.result.variation_prompt} />
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {variation.result.variation_prompt}
                  </p>
                  {variation.result.photography_notes && (
                    <p className="text-xs text-zinc-600 mt-2 italic">
                      💡 {variation.result.photography_notes}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => generateSingle(variation.id)}
                  disabled={(!variation.color && !variation.material && !variation.background) || generatingId === variation.id}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                    (!variation.color && !variation.material && !variation.background)
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : generatingId === variation.id
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                  }`}
                >
                  {generatingId === variation.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    "Generate This Variation"
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">
            <strong className="text-purple-400">{pendingCount}</strong> pending
          </span>
          <span className="text-zinc-400">
            <strong className="text-green-400">{completedCount}</strong> completed
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <button
              onClick={async () => {
                const allPrompts = variations
                  .filter(v => v.result)
                  .map(v => `## ${getVariationLabel(v)}\n${v.result!.variation_prompt}`)
                  .join("\n\n---\n\n");
                await navigator.clipboard.writeText(allPrompts);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy All ({completedCount})
            </button>
          )}
          <button
            onClick={generateAll}
            disabled={pendingCount === 0 || isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              pendingCount > 0 && !isGenerating
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate All ({pendingCount})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

