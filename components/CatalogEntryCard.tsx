"use client";

import { useState } from "react";
import { CatalogEntry } from "@/lib/catalog-prompts";

interface CatalogEntryCardProps {
  entry: CatalogEntry;
  onRemove: (id: string) => void;
}

function Tag({ children, color = "zinc" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    zinc: "bg-zinc-800 text-zinc-300",
    blue: "bg-blue-500/20 text-blue-300",
    green: "bg-green-500/20 text-green-300",
    amber: "bg-amber-500/20 text-amber-300",
    pink: "bg-pink-500/20 text-pink-300",
    purple: "bg-purple-500/20 text-purple-300",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[color]}`}>
      {children}
    </span>
  );
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
      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

export default function CatalogEntryCard({ entry, onRemove }: CatalogEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { metadata } = entry;

  const allTags = [
    ...metadata.tags.primary,
    ...metadata.tags.secondary,
  ].slice(0, expanded ? undefined : 8);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header with Image */}
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
          <img
            src={entry.thumbnail}
            alt={entry.filename}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-zinc-100 truncate">{entry.filename}</h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                {metadata.classification.primary_category} • {metadata.classification.orientation}
              </p>
            </div>
            <button
              onClick={() => onRemove(entry.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Tag color="blue">{metadata.classification.primary_category}</Tag>
            {metadata.classification.subcategories.slice(0, 2).map((sub, idx) => (
              <Tag key={idx}>{sub}</Tag>
            ))}
            <Tag color="amber">{metadata.mood_atmosphere.primary_mood}</Tag>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 mt-2">
            {metadata.visual_elements.dominant_colors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="w-5 h-5 rounded border border-zinc-700"
                style={{ backgroundColor: color.hex }}
                title={`${color.name} (${color.percentage}%)`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-1">
          {allTags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400"
            >
              {tag}
            </span>
          ))}
          {!expanded && metadata.tags.primary.length + metadata.tags.secondary.length > 8 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs px-2 py-0.5 text-teal-400 hover:text-teal-300"
            >
              +{metadata.tags.primary.length + metadata.tags.secondary.length - 8} more
            </button>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 transition-colors"
      >
        <span>{expanded ? "Hide details" : "Show details"}</span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-800 bg-zinc-900/30">
          {/* SEO Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">SEO</h5>
              <CopyButton text={metadata.seo.alt_text} label="alt text" />
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-zinc-500">Title:</span>
                <p className="text-sm text-zinc-300">{metadata.seo.title}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Alt Text:</span>
                <p className="text-sm text-zinc-300">{metadata.seo.alt_text}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Description:</span>
                <p className="text-sm text-zinc-400">{metadata.seo.description}</p>
              </div>
            </div>
          </div>

          {/* Objects & Elements */}
          <div>
            <h5 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Objects Detected</h5>
            <div className="flex flex-wrap gap-1">
              {metadata.visual_elements.objects.map((obj, idx) => (
                <Tag key={idx} color="green">{obj}</Tag>
              ))}
            </div>
          </div>

          {/* Context */}
          <div>
            <h5 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Context</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500">Setting:</span>
                <span className="text-zinc-300 ml-1">{metadata.context.setting}</span>
              </div>
              <div>
                <span className="text-zinc-500">Location:</span>
                <span className="text-zinc-300 ml-1">{metadata.context.location_type}</span>
              </div>
              <div>
                <span className="text-zinc-500">Time:</span>
                <span className="text-zinc-300 ml-1">{metadata.context.time_of_day}</span>
              </div>
              <div>
                <span className="text-zinc-500">Season:</span>
                <span className="text-zinc-300 ml-1">{metadata.context.season}</span>
              </div>
            </div>
          </div>

          {/* Technical */}
          <div>
            <h5 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Technical</h5>
            <div className="flex flex-wrap gap-1">
              <Tag>{metadata.technical.photography_style}</Tag>
              <Tag>{metadata.technical.lighting}</Tag>
              <Tag>{metadata.technical.composition}</Tag>
            </div>
          </div>

          {/* Usage Hints */}
          <div>
            <h5 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Usage</h5>
            <div className="flex flex-wrap gap-1 mb-2">
              {metadata.usage_hints.suitable_for.map((use, idx) => (
                <Tag key={idx} color="purple">{use}</Tag>
              ))}
            </div>
            <div className="flex gap-4 text-xs">
              <span className={metadata.usage_hints.model_release_likely_needed ? "text-amber-400" : "text-green-400"}>
                {metadata.usage_hints.model_release_likely_needed ? "⚠️ Model release likely needed" : "✓ No model release needed"}
              </span>
            </div>
          </div>

          {/* All Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">All Tags</h5>
              <CopyButton 
                text={[...metadata.tags.primary, ...metadata.tags.secondary, ...metadata.tags.style, ...metadata.tags.mood].join(", ")} 
                label="tags" 
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {[...metadata.tags.primary, ...metadata.tags.secondary, ...metadata.tags.style, ...metadata.tags.mood, ...metadata.tags.color].map((tag, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}










