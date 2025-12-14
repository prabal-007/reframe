"use client";

import { useState, useEffect } from "react";
import { VisionStructOutput, SceneObject } from "@/lib/types";

interface SceneEditorProps {
  data: VisionStructOutput;
  onChange: (data: VisionStructOutput) => void;
  /** Original data for detecting modifications */
  originalData?: VisionStructOutput;
  /** Whether rendering is in progress - triggers causality highlight */
  isRendering?: boolean;
}

// Track which fields have been modified
type ModifiedFields = Set<string>;

// Reusable select component with modified indicator
function Select({ 
  label, 
  value, 
  options, 
  onChange,
  isModified,
  fieldKey,
  isHighlighted,
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (value: string) => void;
  isModified?: boolean;
  fieldKey?: string;
  isHighlighted?: boolean;
}) {
  return (
    <div className={`
      flex flex-col gap-1.5 transition-all duration-300
      ${isHighlighted ? 'ring-2 ring-[var(--ai-cyan)]/30 rounded-lg p-1 -m-1' : ''}
    `}>
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium flex items-center gap-2">
        {label}
        {isModified && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[var(--warning)]/10 text-[var(--warning)] font-medium">
            Modified
          </span>
        )}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          bg-[var(--bg-elevated)] border 
          ${isModified ? 'border-[var(--warning)]/30' : 'border-[var(--glass-border)]'}
          rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]
          focus:outline-none focus:border-[var(--accent-primary)] 
          focus:ring-2 focus:ring-[var(--accent-soft)]
          transition-all duration-[var(--motion-fast)]
          cursor-pointer
        `}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// Reusable text input with modified indicator
function TextInput({ 
  label, 
  value, 
  onChange,
  multiline = false,
  isModified,
  isHighlighted,
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  multiline?: boolean;
  isModified?: boolean;
  isHighlighted?: boolean;
}) {
  const baseClass = `
    w-full bg-[var(--bg-elevated)] border 
    ${isModified ? 'border-[var(--warning)]/30' : 'border-[var(--glass-border)]'}
    rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]
    placeholder:text-[var(--text-muted)]
    focus:outline-none focus:border-[var(--accent-primary)] 
    focus:ring-2 focus:ring-[var(--accent-soft)]
    transition-all duration-[var(--motion-fast)]
  `;
  
  return (
    <div className={`
      flex flex-col gap-1.5 transition-all duration-300
      ${isHighlighted ? 'ring-2 ring-[var(--ai-cyan)]/30 rounded-lg p-1 -m-1' : ''}
    `}>
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium flex items-center gap-2">
        {label}
        {isModified && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[var(--warning)]/10 text-[var(--warning)] font-medium">
            Modified
          </span>
        )}
      </label>
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

// Color input with hex preview and modified indicator
function ColorInput({ 
  label, 
  value, 
  onChange,
  isModified,
  isHighlighted,
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  isModified?: boolean;
  isHighlighted?: boolean;
}) {
  return (
    <div className={`
      flex flex-col gap-1.5 transition-all duration-300
      ${isHighlighted ? 'ring-2 ring-[var(--ai-cyan)]/30 rounded-lg p-1 -m-1' : ''}
    `}>
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium flex items-center gap-2">
        {label}
        {isModified && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[var(--warning)]/10 text-[var(--warning)] font-medium">
            Modified
          </span>
        )}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent opacity-0 absolute inset-0"
          />
          <div 
            className={`
              w-10 h-10 rounded-lg border shadow-sm
              ${isModified ? 'border-[var(--warning)]/30' : 'border-[var(--glass-border)]'}
            `}
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            flex-1 bg-[var(--bg-elevated)] border 
            ${isModified ? 'border-[var(--warning)]/30' : 'border-[var(--glass-border)]'}
            rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono
            focus:outline-none focus:border-[var(--accent-primary)]
            transition-all duration-[var(--motion-fast)]
          `}
        />
      </div>
    </div>
  );
}

// Collapsible section wrapper
function Section({ 
  title, 
  children,
  defaultOpen = true,
  modifiedCount = 0,
  isHighlighted = false,
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  modifiedCount?: number;
  isHighlighted?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`
      space-y-4 transition-all duration-300
      ${isHighlighted ? 'bg-[var(--ai-cyan)]/5 rounded-xl p-2 -m-2' : ''}
    `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          {title}
          {modifiedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--warning)]/10 text-[var(--warning)] font-medium">
              {modifiedCount} modified
            </span>
          )}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="grid gap-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SceneEditor({ data, onChange, originalData, isRendering }: SceneEditorProps) {
  const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set());

  // Calculate modified fields by comparing with original
  const getModifiedFields = (): ModifiedFields => {
    if (!originalData) return new Set();
    
    const modified = new Set<string>();
    
    // Check global context
    if (data.global_context.scene_description !== originalData.global_context.scene_description) {
      modified.add('scene_description');
    }
    if (data.global_context.time_of_day !== originalData.global_context.time_of_day) {
      modified.add('time_of_day');
    }
    if (data.global_context.weather_atmosphere !== originalData.global_context.weather_atmosphere) {
      modified.add('weather_atmosphere');
    }
    
    // Check lighting
    if (data.global_context.lighting.source !== originalData.global_context.lighting.source) {
      modified.add('lighting_source');
    }
    if (data.global_context.lighting.direction !== originalData.global_context.lighting.direction) {
      modified.add('lighting_direction');
    }
    if (data.global_context.lighting.quality !== originalData.global_context.lighting.quality) {
      modified.add('lighting_quality');
    }
    if (data.global_context.lighting.color_temp !== originalData.global_context.lighting.color_temp) {
      modified.add('lighting_color_temp');
    }
    
    // Check composition
    if (data.composition.camera_angle !== originalData.composition.camera_angle) {
      modified.add('camera_angle');
    }
    if (data.composition.framing !== originalData.composition.framing) {
      modified.add('framing');
    }
    if (data.composition.depth_of_field !== originalData.composition.depth_of_field) {
      modified.add('depth_of_field');
    }
    if (data.composition.focal_point !== originalData.composition.focal_point) {
      modified.add('focal_point');
    }
    
    // Check colors
    data.color_palette.dominant_hex_estimates.forEach((color, idx) => {
      if (color !== originalData.color_palette.dominant_hex_estimates[idx]) {
        modified.add(`color_${idx}`);
      }
    });
    if (data.color_palette.contrast_level !== originalData.color_palette.contrast_level) {
      modified.add('contrast_level');
    }
    
    // Check objects
    data.objects.forEach((obj, idx) => {
      const origObj = originalData.objects[idx];
      if (origObj) {
        if (obj.label !== origObj.label) modified.add(`object_${obj.id}_label`);
        if (obj.prominence !== origObj.prominence) modified.add(`object_${obj.id}_prominence`);
        if (obj.location !== origObj.location) modified.add(`object_${obj.id}_location`);
        if (obj.visual_attributes.state !== origObj.visual_attributes.state) {
          modified.add(`object_${obj.id}_state`);
        }
      }
    });
    
    return modified;
  };

  const modifiedFields = getModifiedFields();

  // Count modifications per section
  const atmosphereModCount = ['scene_description', 'time_of_day', 'weather_atmosphere']
    .filter(f => modifiedFields.has(f)).length;
  const lightingModCount = ['lighting_source', 'lighting_direction', 'lighting_quality', 'lighting_color_temp']
    .filter(f => modifiedFields.has(f)).length;
  const compositionModCount = ['camera_angle', 'framing', 'depth_of_field', 'focal_point']
    .filter(f => modifiedFields.has(f)).length;
  const colorModCount = [...modifiedFields].filter(f => f.startsWith('color_') || f === 'contrast_level').length;
  const objectsModCount = [...modifiedFields].filter(f => f.startsWith('object_')).length;

  // Causality highlight effect when rendering starts
  useEffect(() => {
    if (isRendering && modifiedFields.size > 0) {
      // Highlight sections that have modifications
      const sections = new Set<string>();
      if (atmosphereModCount > 0) sections.add('atmosphere');
      if (lightingModCount > 0) sections.add('lighting');
      if (compositionModCount > 0) sections.add('composition');
      if (colorModCount > 0) sections.add('colors');
      if (objectsModCount > 0) sections.add('objects');
      
      setHighlightedSections(sections);
      
      // Clear highlight after 1.5 seconds
      const timer = setTimeout(() => {
        setHighlightedSections(new Set());
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isRendering, modifiedFields.size, atmosphereModCount, lightingModCount, compositionModCount, colorModCount, objectsModCount]);

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
      {/* Atmosphere Section - Always open */}
      <Section 
        title="Atmosphere" 
        defaultOpen={true}
        modifiedCount={atmosphereModCount}
        isHighlighted={highlightedSections.has('atmosphere')}
      >
        <TextInput
          label="Scene Description"
          value={data.global_context.scene_description}
          onChange={(v) => updateGlobalContext("scene_description", v)}
          multiline
          isModified={modifiedFields.has('scene_description')}
          isHighlighted={highlightedSections.has('atmosphere')}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Time of Day"
            value={data.global_context.time_of_day}
            onChange={(v) => updateGlobalContext("time_of_day", v)}
            isModified={modifiedFields.has('time_of_day')}
            isHighlighted={highlightedSections.has('atmosphere')}
          />
          <Select
            label="Weather / Atmosphere"
            value={data.global_context.weather_atmosphere}
            options={["Clear", "Foggy", "Rainy", "Cloudy", "Stormy", "Serene", "Chaotic"]}
            onChange={(v) => updateGlobalContext("weather_atmosphere", v)}
            isModified={modifiedFields.has('weather_atmosphere')}
            isHighlighted={highlightedSections.has('atmosphere')}
          />
        </div>
      </Section>

      {/* Lighting Section - Always open */}
      <Section 
        title="Lighting" 
        defaultOpen={true}
        modifiedCount={lightingModCount}
        isHighlighted={highlightedSections.has('lighting')}
      >
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Light Source"
            value={data.global_context.lighting.source}
            options={["Sunlight", "Artificial", "Mixed", "Moonlight", "Candlelight"]}
            onChange={(v) => updateLighting("source", v)}
            isModified={modifiedFields.has('lighting_source')}
            isHighlighted={highlightedSections.has('lighting')}
          />
          <Select
            label="Direction"
            value={data.global_context.lighting.direction}
            options={["Top-down", "Side-lit", "Backlit", "Front-lit", "Ambient"]}
            onChange={(v) => updateLighting("direction", v)}
            isModified={modifiedFields.has('lighting_direction')}
            isHighlighted={highlightedSections.has('lighting')}
          />
          <Select
            label="Quality"
            value={data.global_context.lighting.quality}
            options={["Hard", "Soft", "Diffused", "Dramatic"]}
            onChange={(v) => updateLighting("quality", v)}
            isModified={modifiedFields.has('lighting_quality')}
            isHighlighted={highlightedSections.has('lighting')}
          />
          <Select
            label="Color Temperature"
            value={data.global_context.lighting.color_temp}
            options={["Warm", "Cool", "Neutral", "Golden Hour", "Blue Hour"]}
            onChange={(v) => updateLighting("color_temp", v)}
            isModified={modifiedFields.has('lighting_color_temp')}
            isHighlighted={highlightedSections.has('lighting')}
          />
        </div>
      </Section>

      {/* Composition Section - Collapsed by default (advanced) */}
      <Section 
        title="Composition" 
        defaultOpen={false}
        modifiedCount={compositionModCount}
        isHighlighted={highlightedSections.has('composition')}
      >
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Camera Angle"
            value={data.composition.camera_angle}
            options={["Eye-level", "High-angle", "Low-angle", "Bird's eye", "Worm's eye", "Dutch angle", "Macro"]}
            onChange={(v) => updateComposition("camera_angle", v)}
            isModified={modifiedFields.has('camera_angle')}
            isHighlighted={highlightedSections.has('composition')}
          />
          <Select
            label="Framing"
            value={data.composition.framing}
            options={["Close-up", "Extreme close-up", "Medium-shot", "Wide-shot", "Full-shot"]}
            onChange={(v) => updateComposition("framing", v)}
            isModified={modifiedFields.has('framing')}
            isHighlighted={highlightedSections.has('composition')}
          />
        </div>
        <TextInput
          label="Depth of Field"
          value={data.composition.depth_of_field}
          onChange={(v) => updateComposition("depth_of_field", v)}
          isModified={modifiedFields.has('depth_of_field')}
          isHighlighted={highlightedSections.has('composition')}
        />
        <TextInput
          label="Focal Point"
          value={data.composition.focal_point}
          onChange={(v) => updateComposition("focal_point", v)}
          isModified={modifiedFields.has('focal_point')}
          isHighlighted={highlightedSections.has('composition')}
        />
      </Section>

      {/* Color Palette Section - Collapsed by default (advanced) */}
      <Section 
        title="Color Palette" 
        defaultOpen={false}
        modifiedCount={colorModCount}
        isHighlighted={highlightedSections.has('colors')}
      >
        <div className="grid grid-cols-2 gap-4">
          {data.color_palette.dominant_hex_estimates.slice(0, 4).map((color, idx) => (
            <ColorInput
              key={idx}
              label={`Dominant Color ${idx + 1}`}
              value={color}
              onChange={(v) => updateColorPalette(idx, v)}
              isModified={modifiedFields.has(`color_${idx}`)}
              isHighlighted={highlightedSections.has('colors')}
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
          isModified={modifiedFields.has('contrast_level')}
          isHighlighted={highlightedSections.has('colors')}
        />
      </Section>

      {/* Objects Section - Always open (most intuitive) */}
      <Section 
        title={`Objects (${data.objects.length})`} 
        defaultOpen={true}
        modifiedCount={objectsModCount}
        isHighlighted={highlightedSections.has('objects')}
      >
        <div className="space-y-4">
          {data.objects.map((obj) => {
            const objModified = [...modifiedFields].some(f => f.startsWith(`object_${obj.id}`));
            return (
              <div 
                key={obj.id} 
                className={`
                  p-4 rounded-xl 
                  bg-[var(--bg-surface)] 
                  border transition-all duration-[var(--motion-fast)]
                  ${objModified ? 'border-[var(--warning)]/30' : 'border-[var(--glass-border)]'}
                  ${highlightedSections.has('objects') ? 'ring-2 ring-[var(--ai-cyan)]/30' : ''}
                  space-y-4
                  hover:border-[var(--accent-soft)]
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{obj.label}</span>
                  <div className="flex items-center gap-2">
                    {objModified && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]/10 text-[var(--warning)] font-medium">
                        Modified
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                      {obj.category}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Label"
                    value={obj.label}
                    onChange={(v) => updateObject(obj.id, { label: v })}
                    isModified={modifiedFields.has(`object_${obj.id}_label`)}
                  />
                  <Select
                    label="Prominence"
                    value={obj.prominence}
                    options={["Foreground", "Midground", "Background"]}
                    onChange={(v) => updateObject(obj.id, { prominence: v })}
                    isModified={modifiedFields.has(`object_${obj.id}_prominence`)}
                  />
                  <TextInput
                    label="Location"
                    value={obj.location}
                    onChange={(v) => updateObject(obj.id, { location: v })}
                    isModified={modifiedFields.has(`object_${obj.id}_location`)}
                  />
                  <TextInput
                    label="State"
                    value={obj.visual_attributes.state}
                    onChange={(v) => updateObject(obj.id, { 
                      visual_attributes: { ...obj.visual_attributes, state: v } 
                    })}
                    isModified={modifiedFields.has(`object_${obj.id}_state`)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
