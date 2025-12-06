"use client";

import { VisionStructOutput, SceneObject } from "@/lib/types";

interface SceneEditorProps {
  data: VisionStructOutput;
  onChange: (data: VisionStructOutput) => void;
}

// Reusable select component
function Select({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// Reusable text input
function TextInput({ 
  label, 
  value, 
  onChange,
  multiline = false
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const baseClass = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors";
  
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      )}
    </div>
  );
}

// Color input with hex preview
function ColorInput({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-amber-500/50"
        />
      </div>
    </div>
  );
}

// Section wrapper
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {title}
      </h3>
      <div className="grid gap-4">
        {children}
      </div>
    </div>
  );
}

export default function SceneEditor({ data, onChange }: SceneEditorProps) {
  const updateGlobalContext = (key: string, value: string) => {
    onChange({
      ...data,
      global_context: {
        ...data.global_context,
        [key]: value,
      },
    });
  };

  const updateLighting = (key: string, value: string) => {
    onChange({
      ...data,
      global_context: {
        ...data.global_context,
        lighting: {
          ...data.global_context.lighting,
          [key]: value,
        },
      },
    });
  };

  const updateComposition = (key: string, value: string) => {
    onChange({
      ...data,
      composition: {
        ...data.composition,
        [key]: value,
      },
    });
  };

  const updateColorPalette = (index: number, value: string) => {
    const newColors = [...data.color_palette.dominant_hex_estimates];
    newColors[index] = value;
    onChange({
      ...data,
      color_palette: {
        ...data.color_palette,
        dominant_hex_estimates: newColors,
      },
    });
  };

  const updateObject = (objectId: string, updates: Partial<SceneObject>) => {
    onChange({
      ...data,
      objects: data.objects.map((obj) =>
        obj.id === objectId ? { ...obj, ...updates } : obj
      ),
    });
  };

  return (
    <div className="space-y-8">
      {/* Atmosphere Section */}
      <Section title="Atmosphere">
        <TextInput
          label="Scene Description"
          value={data.global_context.scene_description}
          onChange={(v) => updateGlobalContext("scene_description", v)}
          multiline
        />
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Time of Day"
            value={data.global_context.time_of_day}
            onChange={(v) => updateGlobalContext("time_of_day", v)}
          />
          <Select
            label="Weather / Atmosphere"
            value={data.global_context.weather_atmosphere}
            options={["Clear", "Foggy", "Rainy", "Cloudy", "Stormy", "Serene", "Chaotic"]}
            onChange={(v) => updateGlobalContext("weather_atmosphere", v)}
          />
        </div>
      </Section>

      {/* Lighting Section */}
      <Section title="Lighting">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Light Source"
            value={data.global_context.lighting.source}
            options={["Sunlight", "Artificial", "Mixed", "Moonlight", "Candlelight"]}
            onChange={(v) => updateLighting("source", v)}
          />
          <Select
            label="Direction"
            value={data.global_context.lighting.direction}
            options={["Top-down", "Side-lit", "Backlit", "Front-lit", "Ambient"]}
            onChange={(v) => updateLighting("direction", v)}
          />
          <Select
            label="Quality"
            value={data.global_context.lighting.quality}
            options={["Hard", "Soft", "Diffused", "Dramatic"]}
            onChange={(v) => updateLighting("quality", v)}
          />
          <Select
            label="Color Temperature"
            value={data.global_context.lighting.color_temp}
            options={["Warm", "Cool", "Neutral", "Golden Hour", "Blue Hour"]}
            onChange={(v) => updateLighting("color_temp", v)}
          />
        </div>
      </Section>

      {/* Composition Section */}
      <Section title="Composition">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Camera Angle"
            value={data.composition.camera_angle}
            options={["Eye-level", "High-angle", "Low-angle", "Bird's eye", "Worm's eye", "Dutch angle", "Macro"]}
            onChange={(v) => updateComposition("camera_angle", v)}
          />
          <Select
            label="Framing"
            value={data.composition.framing}
            options={["Close-up", "Extreme close-up", "Medium-shot", "Wide-shot", "Full-shot"]}
            onChange={(v) => updateComposition("framing", v)}
          />
        </div>
        <TextInput
          label="Depth of Field"
          value={data.composition.depth_of_field}
          onChange={(v) => updateComposition("depth_of_field", v)}
        />
        <TextInput
          label="Focal Point"
          value={data.composition.focal_point}
          onChange={(v) => updateComposition("focal_point", v)}
        />
      </Section>

      {/* Color Palette Section */}
      <Section title="Color Palette">
        <div className="grid grid-cols-2 gap-4">
          {data.color_palette.dominant_hex_estimates.slice(0, 4).map((color, idx) => (
            <ColorInput
              key={idx}
              label={`Dominant Color ${idx + 1}`}
              value={color}
              onChange={(v) => updateColorPalette(idx, v)}
            />
          ))}
        </div>
        <Select
          label="Contrast Level"
          value={data.color_palette.contrast_level}
          options={["High", "Medium", "Low"]}
          onChange={(v) => onChange({
            ...data,
            color_palette: { ...data.color_palette, contrast_level: v as "High" | "Medium" | "Low" }
          })}
        />
      </Section>

      {/* Objects Section */}
      <Section title={`Objects (${data.objects.length})`}>
        <div className="space-y-4">
          {data.objects.map((obj) => (
            <div 
              key={obj.id} 
              className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-200">{obj.label}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400">
                  {obj.category}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Label"
                  value={obj.label}
                  onChange={(v) => updateObject(obj.id, { label: v })}
                />
                <Select
                  label="Prominence"
                  value={obj.prominence}
                  options={["Foreground", "Midground", "Background"]}
                  onChange={(v) => updateObject(obj.id, { prominence: v })}
                />
                <TextInput
                  label="Location"
                  value={obj.location}
                  onChange={(v) => updateObject(obj.id, { location: v })}
                />
                <TextInput
                  label="State"
                  value={obj.visual_attributes.state}
                  onChange={(v) => updateObject(obj.id, { 
                    visual_attributes: { ...obj.visual_attributes, state: v } 
                  })}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

