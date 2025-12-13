"use client";

import { useState, useCallback } from "react";
import { AccessibilityOutput as AccessibilityData } from "@/lib/accessibility-prompts";

interface AccessibilityOutputProps {
  data: AccessibilityData | null;
  isAnalyzing: boolean;
  viewMode: "screen-reader" | "seo" | "low-vision";
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
      className="btn-ghost text-xs py-1"
      title={`Copy ${label}`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-lg 
        transition-all duration-[var(--motion-fast)] text-xs
        ${isSpeaking 
          ? "bg-[var(--ai-cyan-soft)] text-[var(--ai-cyan)] border border-[var(--ai-cyan)]/30" 
          : "btn-ghost"
        }
      `}
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
    <div className={`
      rounded-xl p-5 transition-all duration-[var(--motion-fast)]
      ${highlight 
        ? "bg-[var(--accent-soft)] border border-[var(--accent-primary)]/20" 
        : "bg-[var(--bg-surface)] border border-[var(--glass-border)]"
      }
    `}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium text-sm ${highlight ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
            {title}
          </h3>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SpeakButton text={content} label={title} />
          <CopyButton text={content} label={title} />
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{content}</p>
    </div>
  );
}

// Studio-style audio narration panel
function AudioNarrationPanel({ text, title }: { text: string; title: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setProgress(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    
    // Simulate progress
    const words = text.split(' ').length;
    const duration = (words / 2.5) * 1000; // ~150 words per minute
    const startTime = Date.now();
    
    const updateProgress = () => {
      if (!isSpeaking) return;
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      requestAnimationFrame(updateProgress);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setProgress(0);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking]);

  return (
    <div className="panel-glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--ai-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          {title}
        </h3>
        <span className="ai-badge">Studio Narration</span>
      </div>

      {/* Waveform visualization placeholder */}
      <div className="relative h-16 bg-[var(--bg-surface)] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-100 ${
                isSpeaking ? "bg-[var(--ai-cyan)]" : "bg-[var(--text-muted)]/30"
              }`}
              style={{
                height: isSpeaking 
                  ? `${20 + Math.sin(Date.now() / 100 + i) * 20}px`
                  : '8px',
                opacity: isSpeaking ? 0.8 : 0.3,
              }}
            />
          ))}
        </div>
        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-[var(--ai-cyan)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSpeak}
          className={`
            flex items-center justify-center w-12 h-12 rounded-full
            transition-all duration-[var(--motion-fast)]
            ${isSpeaking 
              ? "bg-[var(--ai-cyan)] text-[var(--bg-root)]" 
              : "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]"
            }
          `}
        >
          {isSpeaking ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {text}
          </p>
        </div>
        <CopyButton text={text} label="narration" />
      </div>
    </div>
  );
}

export default function AccessibilityOutput({ data, isAnalyzing, viewMode }: AccessibilityOutputProps) {
  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-[var(--bg-surface)] border border-[var(--glass-border)] p-5 ai-processing">
            <div className="h-4 bg-[var(--bg-elevated)] rounded w-1/4 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-[var(--bg-elevated)] rounded w-full" />
              <div className="h-3 bg-[var(--bg-elevated)] rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--glass-border)] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Ready to Analyze</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          Upload an image to generate accessible descriptions for screen readers and audio
        </p>
      </div>
    );
  }

  // Different content based on view mode
  if (viewMode === "screen-reader") {
    return (
      <div className="space-y-4">
        <DescriptionCard
          title="Alt Text"
          content={data.short_alt}
          badge="Primary"
          highlight
        />
        <AudioNarrationPanel 
          text={data.long_audio_description} 
          title="Audio Description" 
        />
        {data.detected_text && data.detected_text.length > 0 && (
          <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--glass-border)] p-5">
            <h3 className="font-medium text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Detected Text (OCR)
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.detected_text.map((text, idx) => (
                <span 
                  key={idx}
                  className="text-sm px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-mono"
                >
                  &ldquo;{text}&rdquo;
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === "seo") {
    return (
      <div className="space-y-4">
        <DescriptionCard
          title="SEO Alt Text"
          content={data.short_alt}
          badge="125 chars max"
          highlight
        />
        <DescriptionCard
          title="Rich Description"
          content={data.medium_description}
          badge="Social/OpenGraph"
        />
        {data.suggested_context && (
          <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--glass-border)] p-5">
            <h3 className="font-medium text-sm text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contextual Keywords
            </h3>
            <p className="text-sm text-[var(--text-muted)]">{data.suggested_context}</p>
          </div>
        )}
      </div>
    );
  }

  // Low vision mode - emphasize audio and large text
  return (
    <div className="space-y-4">
      <AudioNarrationPanel 
        text={data.long_audio_description} 
        title="Full Audio Description" 
      />
      <DescriptionCard
        title="Simple Description"
        content={data.medium_description}
        highlight
      />
      {data.content_warnings && data.content_warnings.length > 0 && (
        <div className="rounded-xl bg-warning-soft border border-[var(--warning)]/20 p-5">
          <h3 className="font-medium text-sm text-[var(--warning)] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Content Warnings
          </h3>
          <ul className="space-y-1">
            {data.content_warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-[var(--warning)]/80">• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
