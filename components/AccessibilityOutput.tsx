"use client";

import { useState, useCallback } from "react";
import { AccessibilityOutput as AccessibilityData } from "@/lib/accessibility-prompts";

interface AccessibilityOutputProps {
  data: AccessibilityData | null;
  isAnalyzing: boolean;
}

function CopyButton({ text, label }: { text: string; label: string }) {
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
      title={`Copy ${label}`}
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

function SpeakButton({ text, label }: { text: string; label: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking]);

  return (
    <button
      onClick={handleSpeak}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-xs ${
        isSpeaking 
          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
      }`}
      title={isSpeaking ? "Stop speaking" : `Listen to ${label}`}
    >
      {isSpeaking ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Stop
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Listen
        </>
      )}
    </button>
  );
}

function DescriptionCard({ 
  title, 
  content, 
  badge,
  highlight = false 
}: { 
  title: string; 
  content: string; 
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${
      highlight 
        ? "bg-amber-500/5 border-amber-500/20" 
        : "bg-zinc-900/50 border-zinc-800"
    }`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${highlight ? "text-amber-400" : "text-zinc-200"}`}>
            {title}
          </h3>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SpeakButton text={content} label={title} />
          <CopyButton text={content} label={title} />
        </div>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{content}</p>
    </div>
  );
}

export default function AccessibilityOutput({ data, isAnalyzing }: AccessibilityOutputProps) {
  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-1/4 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-300 mb-2">Ready to Analyze</h3>
        <p className="text-sm text-zinc-500 max-w-xs">
          Upload an image to generate accessible descriptions for screen readers and audio
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Short Alt Text - Highlighted as primary */}
      <DescriptionCard
        title="Alt Text"
        content={data.short_alt}
        badge="Screen Reader"
        highlight
      />

      {/* Medium Description */}
      <DescriptionCard
        title="Medium Description"
        content={data.medium_description}
        badge="Social Media"
      />

      {/* Long Audio Description */}
      <DescriptionCard
        title="Audio Description"
        content={data.long_audio_description}
        badge="Extended"
      />

      {/* Detected Text */}
      {data.detected_text && data.detected_text.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="font-medium text-zinc-200 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Detected Text
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.detected_text.map((text, idx) => (
              <span 
                key={idx}
                className="text-sm px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-mono"
              >
                "{text}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content Warnings */}
      {data.content_warnings && data.content_warnings.length > 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <h3 className="font-medium text-yellow-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Content Warnings
          </h3>
          <ul className="space-y-1">
            {data.content_warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-yellow-200/70">• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Context */}
      {data.suggested_context && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="font-medium text-zinc-200 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Suggested Context
          </h3>
          <p className="text-sm text-zinc-500">{data.suggested_context}</p>
        </div>
      )}
    </div>
  );
}

