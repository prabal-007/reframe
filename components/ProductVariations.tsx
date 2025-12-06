"use client";

import { useState, useCallback } from "react";
import { 
  ProductAnalysis, 
  VariationRequest, 
  VariationResult,
  COLOR_PALETTES, 
  BACKGROUND_PRESETS, 
  MATERIAL_OPTIONS 
} from "@/lib/product-prompts";

interface ProductVariationsProps {
  productData: ProductAnalysis;
  onGenerateVariation: (variation: VariationRequest) => Promise<VariationResult | null>;
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

interface SelectableItemProps {
  type: string;
  value: string;
  displayValue: string;
  isSelected: boolean;
  isGenerated: boolean;
  onToggle: () => void;
}

function SelectableItem({ type, value, displayValue, isSelected, isGenerated, onToggle }: SelectableItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left w-full
        ${isGenerated 
          ? "bg-green-500/5 border-green-500/30 cursor-default" 
          : isSelected 
            ? "bg-purple-500/10 border-purple-500/30" 
            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
        }
      `}
    >
      {/* Checkbox */}
      <div className={`
        w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
        ${isGenerated 
          ? "bg-green-500 border-green-500" 
          : isSelected 
            ? "bg-purple-500 border-purple-500" 
            : "border-zinc-600"
        }
      `}>
        {(isSelected || isGenerated) && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-zinc-200 block truncate">{displayValue}</span>
        <span className="text-xs text-zinc-500">{type}</span>
      </div>

      {/* Status Badge */}
      {isGenerated && (
        <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
          ✓ Done
        </span>
      )}
    </button>
  );
}

interface GeneratedResultProps {
  type: string;
  value: string;
  result: VariationResult;
}

function GeneratedResult({ type, value, result }: GeneratedResultProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-zinc-200 block">{value}</span>
            <span className="text-xs text-zinc-500">{type}</span>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800">
          <div className="flex items-start justify-between gap-2 mt-3 mb-2">
            <span className="text-xs text-zinc-500">Generated Prompt</span>
            <CopyButton text={result.variation_prompt} />
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {result.variation_prompt}
          </p>
          {result.photography_notes && (
            <p className="text-xs text-zinc-600 mt-3 italic flex items-center gap-1">
              <span>💡</span> {result.photography_notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductVariations({ productData, onGenerateVariation }: ProductVariationsProps) {
  const [activeTab, setActiveTab] = useState<"colors" | "materials" | "backgrounds" | "custom">("colors");
  const [selectedItems, setSelectedItems] = useState<Map<string, { type: string; value: string; displayValue: string }>>(new Map());
  const [results, setResults] = useState<Map<string, VariationResult>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [customColor, setCustomColor] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof COLOR_PALETTES>("neutrals");

  const toggleSelection = useCallback((key: string, type: string, value: string, displayValue: string) => {
    // Don't allow toggling if already generated
    if (results.has(key)) return;

    setSelectedItems(prev => {
      const newMap = new Map(prev);
      if (newMap.has(key)) {
        newMap.delete(key);
      } else {
        newMap.set(key, { type, value, displayValue });
      }
      return newMap;
    });
  }, [results]);

  const handleGenerateSelected = useCallback(async () => {
    if (selectedItems.size === 0) return;

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: selectedItems.size });

    const entries = Array.from(selectedItems.entries());
    
    for (let i = 0; i < entries.length; i++) {
      const [key, item] = entries[i];
      setGenerationProgress({ current: i + 1, total: entries.length });

      const result = await onGenerateVariation({
        type: item.type as "color" | "material" | "background",
        value: item.value,
      });

      if (result) {
        setResults(prev => new Map(prev).set(key, result));
      }
    }

    // Clear selections after generation
    setSelectedItems(new Map());
    setIsGenerating(false);
  }, [selectedItems, onGenerateVariation]);

  const handleAddCustom = useCallback(() => {
    if (!customColor.trim()) return;
    const key = `color-${customColor.trim()}`;
    toggleSelection(key, "color", customColor.trim(), customColor.trim());
    setCustomColor("");
  }, [customColor, toggleSelection]);

  const selectAll = useCallback((items: { key: string; type: string; value: string; displayValue: string }[]) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      items.forEach(item => {
        if (!results.has(item.key)) {
          newMap.set(item.key, { type: item.type, value: item.value, displayValue: item.displayValue });
        }
      });
      return newMap;
    });
  }, [results]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Map());
  }, []);

  const tabs = [
    { id: "colors", label: "Colors", icon: "🎨" },
    { id: "materials", label: "Materials", icon: "✨" },
    { id: "backgrounds", label: "Backgrounds", icon: "🖼️" },
    { id: "custom", label: "Custom", icon: "⚡" },
  ];

  // Build variation items for current tab
  const getCurrentItems = () => {
    switch (activeTab) {
      case "colors":
        return COLOR_PALETTES[selectedPalette].map(color => ({
          key: `color-${color}`,
          type: "color",
          value: color,
          displayValue: color,
        }));
      case "materials":
        return MATERIAL_OPTIONS.map(material => ({
          key: `material-${material}`,
          type: "material",
          value: material,
          displayValue: material,
        }));
      case "backgrounds":
        return BACKGROUND_PRESETS.map(bg => ({
          key: `background-${bg.name}`,
          type: "background",
          value: bg.value,
          displayValue: bg.name,
        }));
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();
  const selectedCount = selectedItems.size;
  const generatedCount = results.size;

  return (
    <div className="space-y-6">
      {/* Product Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-zinc-100">{productData.product.name}</h3>
            <p className="text-sm text-zinc-500 mt-1">
              {productData.product.category} • {productData.product.current_color} • {productData.product.current_material}
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {productData.photography.angle}
          </span>
        </div>
      </div>

      {/* Selection Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-purple-400">{selectedCount}</span>
            </div>
            <span className="text-sm text-zinc-400">selected</span>
          </div>
          {generatedCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-green-400">{generatedCount}</span>
              </div>
              <span className="text-sm text-zinc-400">generated</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleGenerateSelected}
            disabled={selectedCount === 0 || isGenerating}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${selectedCount > 0 && !isGenerating
                ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }
            `}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating {generationProgress.current}/{generationProgress.total}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate {selectedCount > 0 ? `(${selectedCount})` : "Selected"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "colors" && (
          <>
            {/* Palette Selector */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {Object.keys(COLOR_PALETTES).map((palette) => (
                  <button
                    key={palette}
                    onClick={() => setSelectedPalette(palette as keyof typeof COLOR_PALETTES)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      selectedPalette === palette
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {palette}
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectAll(currentItems)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Select All
              </button>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-2 gap-2">
              {currentItems.map((item) => (
                <SelectableItem
                  key={item.key}
                  type="Color"
                  value={item.value}
                  displayValue={item.displayValue}
                  isSelected={selectedItems.has(item.key)}
                  isGenerated={results.has(item.key)}
                  onToggle={() => toggleSelection(item.key, item.type, item.value, item.displayValue)}
                />
              ))}
            </div>

            {/* AI Suggested */}
            {productData.suggested_variations.colors.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <span className="text-amber-400">✦</span> AI Suggested
                  </h4>
                  <button
                    onClick={() => selectAll(productData.suggested_variations.colors.map(c => ({
                      key: `color-${c}`,
                      type: "color",
                      value: c,
                      displayValue: c,
                    })))}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {productData.suggested_variations.colors.map((color) => {
                    const key = `color-${color}`;
                    return (
                      <SelectableItem
                        key={key}
                        type="Color"
                        value={color}
                        displayValue={color}
                        isSelected={selectedItems.has(key)}
                        isGenerated={results.has(key)}
                        onToggle={() => toggleSelection(key, "color", color, color)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "materials" && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => selectAll(currentItems)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {currentItems.map((item) => (
                <SelectableItem
                  key={item.key}
                  type="Material"
                  value={item.value}
                  displayValue={item.displayValue}
                  isSelected={selectedItems.has(item.key)}
                  isGenerated={results.has(item.key)}
                  onToggle={() => toggleSelection(item.key, item.type, item.value, item.displayValue)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "backgrounds" && (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => selectAll(currentItems)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Select All
              </button>
            </div>
            <div className="grid gap-2">
              {currentItems.map((item) => (
                <SelectableItem
                  key={item.key}
                  type="Background"
                  value={item.value}
                  displayValue={item.displayValue}
                  isSelected={selectedItems.has(item.key)}
                  isGenerated={results.has(item.key)}
                  onToggle={() => toggleSelection(item.key, item.type, item.value, item.displayValue)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "custom" && (
          <div className="space-y-4">
            {/* Custom Input */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Add Custom Variation
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                  placeholder="e.g., Midnight Blue, Rose Gold, Bamboo..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={handleAddCustom}
                  disabled={!customColor.trim()}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Seasonal Variations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <span>🗓️</span> Seasonal Editions
                </h4>
                <button
                  onClick={() => selectAll(productData.suggested_variations.seasonal.map(s => ({
                    key: `seasonal-${s}`,
                    type: "seasonal",
                    value: s,
                    displayValue: s,
                  })))}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Select All
                </button>
              </div>
              <div className="grid gap-2">
                {productData.suggested_variations.seasonal.map((seasonal) => {
                  const key = `seasonal-${seasonal}`;
                  return (
                    <SelectableItem
                      key={key}
                      type="Seasonal"
                      value={seasonal}
                      displayValue={seasonal}
                      isSelected={selectedItems.has(key)}
                      isGenerated={results.has(key)}
                      onToggle={() => toggleSelection(key, "seasonal", seasonal, seasonal)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Results */}
      {results.size > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generated Prompts ({results.size})
            </h4>
            <button
              onClick={async () => {
                const allPrompts = Array.from(results.entries())
                  .map(([key, result]) => `## ${key}\n${result.variation_prompt}`)
                  .join("\n\n---\n\n");
                await navigator.clipboard.writeText(allPrompts);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy All
            </button>
          </div>
          
          <div className="space-y-2">
            {Array.from(results.entries()).map(([key, result]) => {
              const [type, ...valueParts] = key.split("-");
              const value = valueParts.join("-");
              return (
                <GeneratedResult
                  key={key}
                  type={type.charAt(0).toUpperCase() + type.slice(1)}
                  value={value}
                  result={result}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
