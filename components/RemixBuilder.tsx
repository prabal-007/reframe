"use client";

import { useState, useCallback } from "react";
import { VisualDNA, RemixResult, REMIX_CONCEPTS, STYLE_MODIFIERS } from "@/lib/remix-prompts";

interface RemixBuilderProps {
  visualDNA: VisualDNA;
  onGenerate: (params: {
    newConcept: string;
    styleModifier?: string;
    customElements: {
      keepColors: boolean;
      keepLighting: boolean;
      keepComposition: boolean;
      keepMood: boolean;
      keepTextures: boolean;
    };
  }) => Promise<RemixResult | null>;
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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-xs text-zinc-400 hover:text-zinc-200"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
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

export default function RemixBuilder({ visualDNA, onGenerate }: RemixBuilderProps) {
  const [customConcept, setCustomConcept] = useState("");
  const [selectedModifier, setSelectedModifier] = useState<string | undefined>(undefined);
  const [elements, setElements] = useState({
    keepColors: true,
    keepLighting: true,
    keepComposition: true,
    keepMood: true,
    keepTextures: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Array<{ concept: string; result: RemixResult }>>([]);

  const handleGenerate = useCallback(async (concept: string) => {
    if (!concept.trim()) return;

    setIsGenerating(true);
    const result = await onGenerate({
      newConcept: concept,
      styleModifier: selectedModifier,
      customElements: elements,
    });

    if (result) {
      setResults(prev => [{ concept, result }, ...prev]);
    }
    setIsGenerating(false);
  }, [onGenerate, selectedModifier, elements]);

  const toggleElement = (key: keyof typeof elements) => {
    setElements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const elementButtons = [
    { key: "keepMood" as const, label: "Style & Mood", icon: "🎭" },
    { key: "keepColors" as const, label: "Colors", icon: "🎨" },
    { key: "keepLighting" as const, label: "Lighting", icon: "💡" },
    { key: "keepComposition" as const, label: "Composition", icon: "📐" },
    { key: "keepTextures" as const, label: "Textures", icon: "🧱" },
  ];

  return (
    <div className="space-y-6">
      {/* DNA Elements Toggle */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">
          Elements to Transfer
        </h4>
        <div className="flex flex-wrap gap-2">
          {elementButtons.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => toggleElement(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                elements[key]
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-zinc-800 text-zinc-500 border border-transparent hover:text-zinc-300"
              }`}
            >
              <span>{icon}</span>
              {label}
              {elements[key] && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Style Modifiers */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">
          Style Modifier (Optional)
        </h4>
        <div className="flex flex-wrap gap-2">
          {STYLE_MODIFIERS.map((mod) => (
            <button
              key={mod.name}
              onClick={() => setSelectedModifier(
                selectedModifier === mod.prompt ? undefined : mod.prompt
              )}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedModifier === mod.prompt
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {mod.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Concept Input */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">
          New Concept
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={customConcept}
            onChange={(e) => setCustomConcept(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate(customConcept)}
            placeholder="Describe what you want to create in this style..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={() => handleGenerate(customConcept)}
            disabled={!customConcept.trim() || isGenerating}
            className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
              customConcept.trim() && !isGenerating
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Remix"
            )}
          </button>
        </div>
      </div>

      {/* Quick Concepts */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-4">
          Quick Concepts
        </h4>
        <div className="space-y-4">
          {REMIX_CONCEPTS.map((category) => (
            <div key={category.category}>
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                {category.category}
              </span>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleGenerate(item)}
                    disabled={isGenerating}
                    className="px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generated Remixes ({results.length})
            </h4>
            <button
              onClick={async () => {
                const allPrompts = results
                  .map(r => `## ${r.concept}\n${r.result.remix_prompt}`)
                  .join("\n\n---\n\n");
                await navigator.clipboard.writeText(allPrompts);
              }}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Copy All
            </button>
          </div>

          {results.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-green-500/20 bg-green-500/5 overflow-hidden">
              <div className="p-4 border-b border-green-500/10 flex items-center justify-between">
                <span className="font-medium text-zinc-200">{item.concept}</span>
                <CopyButton text={item.result.remix_prompt} />
              </div>
              <div className="p-4">
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                  {item.result.remix_prompt}
                </p>
                {item.result.style_notes && (
                  <p className="text-xs text-zinc-600 italic mb-2">
                    💡 {item.result.style_notes}
                  </p>
                )}
                {item.result.suggested_negative && (
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">Negative prompt: </span>
                    <span className="text-xs text-zinc-600">{item.result.suggested_negative}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

