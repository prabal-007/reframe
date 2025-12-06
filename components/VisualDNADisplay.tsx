"use client";

import { VisualDNA } from "@/lib/remix-prompts";

interface VisualDNADisplayProps {
  data: VisualDNA;
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-6 h-6 rounded-lg border border-zinc-700"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-mono text-zinc-400">{color}</span>
    </div>
  );
}

function Tag({ children, color = "zinc" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    zinc: "bg-zinc-800 text-zinc-300",
    purple: "bg-purple-500/20 text-purple-300",
    amber: "bg-amber-500/20 text-amber-300",
    blue: "bg-blue-500/20 text-blue-300",
    green: "bg-green-500/20 text-green-300",
    pink: "bg-pink-500/20 text-pink-300",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-lg ${colors[color]}`}>
      {children}
    </span>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h4>
      {children}
    </div>
  );
}

export default function VisualDNADisplay({ data }: VisualDNADisplayProps) {
  const { visual_dna, signature_elements, remix_potential } = data;

  return (
    <div className="space-y-6">
      {/* Signature Elements - Hero */}
      <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4">
        <h4 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
          <span>✨</span> Signature Elements
        </h4>
        <div className="space-y-2">
          {signature_elements.map((element, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">{idx + 1}.</span>
              <span className="text-sm text-zinc-300">{element}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Style & Mood */}
      <Section title="Style & Mood" icon="🎭">
        <div className="flex flex-wrap gap-2">
          <Tag color="purple">{visual_dna.style_mood.primary_style}</Tag>
          <Tag color="pink">{visual_dna.style_mood.mood}</Tag>
          <Tag color="amber">{visual_dna.style_mood.era_influence}</Tag>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {visual_dna.style_mood.descriptors.map((desc, idx) => (
            <Tag key={idx}>{desc}</Tag>
          ))}
        </div>
      </Section>

      {/* Color Theory */}
      <Section title="Color Theory" icon="🎨">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-zinc-500 block mb-2">Dominant</span>
            <div className="space-y-1.5">
              {visual_dna.color_theory.dominant_colors.map((color, idx) => (
                <ColorSwatch key={idx} color={color} />
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block mb-2">Accents</span>
            <div className="space-y-1.5">
              {visual_dna.color_theory.accent_colors.map((color, idx) => (
                <ColorSwatch key={idx} color={color} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Tag>{visual_dna.color_theory.palette_type}</Tag>
          <Tag>{visual_dna.color_theory.saturation}</Tag>
          <Tag>{visual_dna.color_theory.temperature}</Tag>
          <Tag>{visual_dna.color_theory.contrast} contrast</Tag>
        </div>
      </Section>

      {/* Lighting */}
      <Section title="Lighting Signature" icon="💡">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <span className="text-xs text-zinc-500 block">Key Light</span>
            <span className="text-sm text-zinc-200">{visual_dna.lighting_signature.key_light}</span>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <span className="text-xs text-zinc-500 block">Direction</span>
            <span className="text-sm text-zinc-200">{visual_dna.lighting_signature.direction}</span>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <span className="text-xs text-zinc-500 block">Shadows</span>
            <span className="text-sm text-zinc-200">{visual_dna.lighting_signature.shadow_quality}</span>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <span className="text-xs text-zinc-500 block">Highlights</span>
            <span className="text-sm text-zinc-200">{visual_dna.lighting_signature.highlight_style}</span>
          </div>
        </div>
      </Section>

      {/* Composition */}
      <Section title="Composition" icon="📐">
        <div className="flex flex-wrap gap-2">
          <Tag color="blue">{visual_dna.composition.layout}</Tag>
          <Tag color="blue">{visual_dna.composition.balance}</Tag>
          <Tag color="blue">{visual_dna.composition.negative_space} space</Tag>
          <Tag color="blue">{visual_dna.composition.depth_layers}</Tag>
        </div>
      </Section>

      {/* Textures & Materials */}
      <Section title="Texture & Material" icon="🧱">
        <div className="flex flex-wrap gap-2">
          {visual_dna.texture_material.primary_textures.map((tex, idx) => (
            <Tag key={idx} color="green">{tex}</Tag>
          ))}
          <Tag>{visual_dna.texture_material.surface_quality}</Tag>
        </div>
      </Section>

      {/* Technical */}
      <Section title="Technical Approach" icon="📷">
        <div className="flex flex-wrap gap-2">
          <Tag>{visual_dna.technical_approach.medium}</Tag>
          <Tag>{visual_dna.technical_approach.lens_style} lens</Tag>
          <Tag>{visual_dna.technical_approach.processing}</Tag>
        </div>
      </Section>

      {/* Visual Motifs */}
      <Section title="Visual Motifs" icon="🔮">
        <div className="flex flex-wrap gap-2">
          {visual_dna.visual_motifs.map((motif, idx) => (
            <Tag key={idx} color="amber">{motif}</Tag>
          ))}
        </div>
      </Section>

      {/* Remix Potential */}
      <div className="rounded-xl bg-zinc-800/30 border border-zinc-700/50 p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
          <span>🎯</span> Remix Potential
        </h4>
        <p className="text-sm text-zinc-400 mb-3">{remix_potential.key_transferable}</p>
        <div className="flex flex-wrap gap-2">
          {remix_potential.adaptable_to.map((use, idx) => (
            <Tag key={idx}>{use}</Tag>
          ))}
        </div>
      </div>
    </div>
  );
}

