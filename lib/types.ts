// TypeScript interfaces matching VisionStruct JSON schema

export interface ImageMeta {
  image_quality: "Low" | "Medium" | "High";
  image_type: "Photo" | "Illustration" | "Diagram" | "Screenshot" | string;
  resolution_estimation: string | null;
}

export interface Lighting {
  source: "Sunlight" | "Artificial" | "Mixed" | string;
  direction: "Top-down" | "Backlit" | "Side-lit" | "Front-lit" | string;
  quality: "Hard" | "Soft" | "Diffused" | string;
  color_temp: "Warm" | "Cool" | "Neutral" | string;
}

export interface GlobalContext {
  scene_description: string;
  time_of_day: string;
  weather_atmosphere: "Foggy" | "Clear" | "Rainy" | "Chaotic" | "Serene" | string;
  lighting: Lighting;
}

export interface ColorPalette {
  dominant_hex_estimates: string[];
  accent_colors: string[];
  contrast_level: "High" | "Low" | "Medium";
}

export interface Composition {
  camera_angle: "Eye-level" | "High-angle" | "Low-angle" | "Macro" | string;
  framing: "Close-up" | "Wide-shot" | "Medium-shot" | string;
  depth_of_field: string;
  focal_point: string;
}

export interface VisualAttributes {
  color: string;
  texture: string;
  material: string;
  state: string;
  dimensions_relative: string;
}

export interface SceneObject {
  id: string;
  label: string;
  category: string;
  location: string;
  prominence: "Foreground" | "Background" | "Midground" | string;
  visual_attributes: VisualAttributes;
  micro_details: string[];
  pose_or_orientation: string;
  text_content: string | null;
}

export interface TextOCRContent {
  text: string;
  location: string;
  font_style: string;
  legibility: "Clear" | "Partially obscured" | string;
}

export interface TextOCR {
  present: boolean;
  content: TextOCRContent[];
}

export interface VisionStructOutput {
  meta: ImageMeta;
  global_context: GlobalContext;
  color_palette: ColorPalette;
  composition: Composition;
  objects: SceneObject[];
  text_ocr: TextOCR;
  semantic_relationships: string[];
}

// App state types
export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete" | "error";

export interface AppState {
  image: string | null;
  imageFile: File | null;
  analysisStatus: AnalysisStatus;
  sceneData: VisionStructOutput | null;
  generatedPrompt: string | null;
  error: string | null;
}

// =============================================================================
// Image Generation Types ("Render Reframed Output")
// =============================================================================

/** Status of the image generation process */
export type GenerationStatus = "idle" | "generating" | "complete" | "error";

/** Resolution options for generated images */
export type GenerationResolution = "512x512" | "768x768" | "1024x1024";

/** Metadata about a generated output */
export interface GenerationMetadata {
  model: string;
  resolution: string;
  promptSnapshot: string;
  confidence?: number;
}

/** A generated output with full lineage back to source */
export interface GeneratedOutput {
  /** Unique identifier for this generation */
  id: string;
  /** Reference to the source image (optional, for lineage) */
  sourceImageId?: string;
  /** The generated image as a data URL */
  generatedImageUrl: string;
  /** When this was generated */
  timestamp: number;
  /** Snapshot of scene data at time of generation */
  sceneDataSnapshot?: VisionStructOutput;
  /** The prompt used for generation */
  promptSnapshot: string;
  /** Generation metadata */
  metadata: GenerationMetadata;
}

/** Options for generation request */
export interface GenerationOptions {
  resolution?: GenerationResolution;
}

/** History entry for version tracking */
export interface VersionHistoryEntry {
  id: string;
  type: "upload" | "analysis" | "edit" | "generation";
  timestamp: number;
  description: string;
  data?: GeneratedOutput | VisionStructOutput;
}

/** State for the generation feature */
export interface GenerationState {
  status: GenerationStatus;
  currentOutput: GeneratedOutput | null;
  history: GeneratedOutput[];
  error: string | null;
  hasUserEdits: boolean;
}

