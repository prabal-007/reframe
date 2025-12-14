/**
 * Generation Library for Reframe
 * 
 * Client-side helpers for the "Render Reframed Output" feature.
 * Handles API calls, caching, and version lineage.
 */

import { 
  VisionStructOutput, 
  GeneratedOutput, 
  GenerationOptions,
  GenerationState,
  VersionHistoryEntry 
} from "./types";

// =============================================================================
// API Client
// =============================================================================

interface RenderResponse {
  success: boolean;
  output?: GeneratedOutput;
  error?: string;
  details?: string;
  suggestion?: string;
}

/**
 * Render a reframed output from scene data and prompt
 * 
 * @param sceneData - The analyzed scene data
 * @param prompt - The refined prompt from the user
 * @param sourceImage - Optional source image for reference
 * @param options - Generation options (resolution, etc.)
 */
export async function renderReframedOutput(
  sceneData: VisionStructOutput,
  prompt: string,
  sourceImage?: string,
  options?: GenerationOptions
): Promise<RenderResponse> {
  try {
    const response = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sceneData,
        prompt,
        sourceImage,
        options,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Render failed",
        details: data.details,
        suggestion: data.suggestion,
      };
    }

    return {
      success: true,
      output: data.output,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// =============================================================================
// Client-Side Cache (localStorage)
// =============================================================================

const CACHE_KEY = "reframe_generation_cache";
const CACHE_MAX_ENTRIES = 10;

interface CacheEntry {
  key: string;
  output: GeneratedOutput;
  timestamp: number;
}

/**
 * Generate a cache key from inputs
 */
function generateCacheKey(sceneData: VisionStructOutput, prompt: string): string {
  const sceneHash = JSON.stringify({
    scene: sceneData.global_context.scene_description,
    time: sceneData.global_context.time_of_day,
    atmosphere: sceneData.global_context.weather_atmosphere,
    lighting: sceneData.global_context.lighting,
  });
  
  // Simple hash function
  let hash = 0;
  const str = sceneHash + prompt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `cache_${Math.abs(hash).toString(36)}`;
}

/**
 * Get cached output if available
 */
export function getCachedOutput(
  sceneData: VisionStructOutput, 
  prompt: string
): GeneratedOutput | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cacheJson = localStorage.getItem(CACHE_KEY);
    if (!cacheJson) return null;
    
    const cache: CacheEntry[] = JSON.parse(cacheJson);
    const key = generateCacheKey(sceneData, prompt);
    
    const entry = cache.find(e => e.key === key);
    if (entry) {
      // Check if cache is less than 1 hour old
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - entry.timestamp < oneHour) {
        return entry.output;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Cache a generated output
 */
export function cacheGeneratedOutput(
  sceneData: VisionStructOutput,
  prompt: string,
  output: GeneratedOutput
): void {
  if (typeof window === "undefined") return;
  
  try {
    const cacheJson = localStorage.getItem(CACHE_KEY);
    let cache: CacheEntry[] = cacheJson ? JSON.parse(cacheJson) : [];
    
    const key = generateCacheKey(sceneData, prompt);
    
    // Remove existing entry with same key
    cache = cache.filter(e => e.key !== key);
    
    // Add new entry at the beginning
    cache.unshift({
      key,
      output,
      timestamp: Date.now(),
    });
    
    // Keep only the most recent entries
    cache = cache.slice(0, CACHE_MAX_ENTRIES);
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache errors
  }
}

/**
 * Clear the generation cache
 */
export function clearGenerationCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEY);
}

// =============================================================================
// Version History
// =============================================================================

const HISTORY_KEY = "reframe_version_history";
const HISTORY_MAX_ENTRIES = 50;

/**
 * Add an entry to version history
 */
export function addToVersionHistory(entry: VersionHistoryEntry): void {
  if (typeof window === "undefined") return;
  
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    let history: VersionHistoryEntry[] = historyJson ? JSON.parse(historyJson) : [];
    
    // Add new entry at the beginning
    history.unshift(entry);
    
    // Keep only the most recent entries
    history = history.slice(0, HISTORY_MAX_ENTRIES);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore history errors
  }
}

/**
 * Get version history
 */
export function getVersionHistory(): VersionHistoryEntry[] {
  if (typeof window === "undefined") return [];
  
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch {
    return [];
  }
}

/**
 * Clear version history
 */
export function clearVersionHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

// =============================================================================
// State Helpers
// =============================================================================

/**
 * Create initial generation state
 */
export function createInitialGenerationState(): GenerationState {
  return {
    status: "idle",
    currentOutput: null,
    history: [],
    error: null,
    hasUserEdits: false,
  };
}

/**
 * Create a version history entry from a generated output
 */
export function createGenerationHistoryEntry(output: GeneratedOutput): VersionHistoryEntry {
  return {
    id: output.id,
    type: "generation",
    timestamp: output.timestamp,
    description: "Rendered reframed output",
    data: output,
  };
}

/**
 * Link generated output to source image
 * Creates the lineage connection required for trust & auditability
 */
export function linkToSource(
  output: GeneratedOutput,
  sourceImageId: string,
  sceneData: VisionStructOutput
): GeneratedOutput {
  return {
    ...output,
    sourceImageId,
    sceneDataSnapshot: sceneData,
  };
}

