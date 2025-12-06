"use client";

import { useState } from "react";

interface PromptOutputProps {
  prompt: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  hasSceneData: boolean;
}

export default function PromptOutput({ 
  prompt, 
  isGenerating, 
  onGenerate,
  hasSceneData 
}: PromptOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generated Prompt
        </h2>
        <button
          onClick={onGenerate}
          disabled={!hasSceneData || isGenerating}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200
            ${hasSceneData && !isGenerating
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }
          `}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate Prompt
            </>
          )}
        </button>
      </div>

      <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {prompt ? (
          <>
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 backdrop-blur hover:bg-zinc-700 transition-colors text-xs text-zinc-300"
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
            </div>
            <div className="p-6 pr-24">
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {prompt}
              </p>
            </div>
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-800/30">
              <p className="text-xs text-zinc-500">
                Use this prompt with Midjourney, DALL-E, Imagen, or Stable Diffusion
              </p>
            </div>
          </>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">
              {hasSceneData 
                ? "Click 'Generate Prompt' to create an image generation prompt from your scene data"
                : "Upload and analyze an image first to generate prompts"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

