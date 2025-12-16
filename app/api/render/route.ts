import { NextRequest, NextResponse } from "next/server";
import { getImageGenerationModel, createImagePart, getMimeType } from "@/lib/gemini";
import { VisionStructOutput } from "@/lib/types";

interface RenderRequest {
  sceneData: VisionStructOutput;
  prompt: string;
  sourceImage?: string;
  options?: {
    resolution?: "512x512" | "768x768" | "1024x1024";
  };
}

export async function POST(request: NextRequest) {
  try {
    const { sceneData, prompt, sourceImage, options }: RenderRequest = await request.json();

    if (!sceneData || !prompt) {
      return NextResponse.json(
        { error: "Scene data and prompt are required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = getImageGenerationModel();
    
    // Build the generation prompt that emphasizes deriving from understanding
    const generationPrompt = buildGenerationPrompt(sceneData, prompt, options?.resolution);

    // Prepare content array
    const contentParts: (string | { inlineData: { data: string; mimeType: string } })[] = [
      generationPrompt,
    ];

    // Include source image as reference if provided
    if (sourceImage) {
      const mimeType = getMimeType(sourceImage);
      const imagePart = createImagePart(sourceImage, mimeType);
      contentParts.push(imagePart);
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: contentParts.map((part) =>
            typeof part === "string" ? { text: part } : part
          ),
        },
      ],
    });

    const response = result.response;
    
    // Extract generated image from response
    const generatedImage = extractGeneratedImage(response);
    
    if (!generatedImage) {
      // If no image was generated, return the text response for debugging
      const textResponse = response.text?.() || "No response text";
      return NextResponse.json(
        { 
          error: "Failed to generate image", 
          details: textResponse,
          suggestion: "The model may not support image generation or the prompt needs adjustment"
        },
        { status: 500 }
      );
    }

    // Build the output with lineage metadata
    const output = {
      id: generateId(),
      generatedImageUrl: `data:${generatedImage.mimeType};base64,${generatedImage.data}`,
      timestamp: Date.now(),
      metadata: {
        model: "gemini-2.0-flash-exp",
        resolution: options?.resolution || "auto",
        promptSnapshot: prompt,
      },
    };

    return NextResponse.json({ 
      success: true,
      output,
    });

  } catch (error) {
    console.error("Render error:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("rate")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      if (error.message.includes("safety") || error.message.includes("blocked")) {
        return NextResponse.json(
          { error: "Content was filtered by safety settings. Try adjusting your scene parameters." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Render failed" },
      { status: 500 }
    );
  }
}

/**
 * Build a generation prompt that emphasizes deriving from scene understanding
 */
function buildGenerationPrompt(
  sceneData: VisionStructOutput, 
  userPrompt: string,
  resolution?: string
): string {
  const resolutionHint = resolution ? `Target resolution: ${resolution}.` : "";
  
  return `You are a controlled image synthesis system. Generate an image that is DERIVED from the following scene understanding.

SCENE UNDERSTANDING (Source of Truth):
- Scene: ${sceneData.global_context.scene_description}
- Time: ${sceneData.global_context.time_of_day}
- Atmosphere: ${sceneData.global_context.weather_atmosphere}
- Lighting: ${sceneData.global_context.lighting.source}, ${sceneData.global_context.lighting.direction}, ${sceneData.global_context.lighting.quality}
- Color Temperature: ${sceneData.global_context.lighting.color_temp}
- Dominant Colors: ${sceneData.color_palette.dominant_hex_estimates.slice(0, 5).join(", ")}
- Composition: ${sceneData.composition.camera_angle}, ${sceneData.composition.framing}
- Focal Point: ${sceneData.composition.focal_point}
- Key Objects: ${sceneData.objects.slice(0, 5).map(o => o.label).join(", ")}

USER REFINEMENT PROMPT:
${userPrompt}

${resolutionHint}

Generate an image that faithfully represents this scene understanding with the user's refinements applied. Maintain visual consistency with the original scene's lighting, color palette, and composition while incorporating the specified changes.`;
}

/**
 * Extract generated image from Gemini response
 */
function extractGeneratedImage(response: { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> } }> }): { data: string; mimeType: string } | null {
  try {
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) return null;

    const parts = candidates[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
      if (part.inlineData?.data && part.inlineData?.mimeType) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a unique ID for the output
 */
function generateId(): string {
  return `rf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

