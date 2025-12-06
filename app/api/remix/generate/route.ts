import { NextRequest, NextResponse } from "next/server";
import { getTextModel } from "@/lib/gemini";
import { REMIX_GENERATOR_PROMPT, VisualDNA } from "@/lib/remix-prompts";

export async function POST(request: NextRequest) {
  try {
    const { visualDNA, newConcept, styleModifier, customElements } = await request.json() as {
      visualDNA: VisualDNA;
      newConcept: string;
      styleModifier?: string;
      customElements?: {
        keepColors: boolean;
        keepLighting: boolean;
        keepComposition: boolean;
        keepMood: boolean;
        keepTextures: boolean;
      };
    };

    if (!visualDNA || !newConcept) {
      return NextResponse.json(
        { error: "Missing visual DNA or new concept" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = getTextModel();

    // Build selective DNA based on what user wants to keep
    let dnaDescription = "";
    
    if (!customElements || customElements.keepMood) {
      dnaDescription += `\nSTYLE & MOOD: ${visualDNA.visual_dna.style_mood.primary_style}, ${visualDNA.visual_dna.style_mood.mood}, ${visualDNA.visual_dna.style_mood.era_influence} influence. Descriptors: ${visualDNA.visual_dna.style_mood.descriptors.join(", ")}`;
    }
    
    if (!customElements || customElements.keepColors) {
      dnaDescription += `\nCOLOR THEORY: ${visualDNA.visual_dna.color_theory.palette_type} palette, ${visualDNA.visual_dna.color_theory.saturation} saturation, ${visualDNA.visual_dna.color_theory.temperature} temperature. Dominant: ${visualDNA.visual_dna.color_theory.dominant_colors.join(", ")}`;
    }
    
    if (!customElements || customElements.keepLighting) {
      dnaDescription += `\nLIGHTING: ${visualDNA.visual_dna.lighting_signature.key_light} key light, ${visualDNA.visual_dna.lighting_signature.direction} direction, ${visualDNA.visual_dna.lighting_signature.shadow_quality} shadows, ${visualDNA.visual_dna.lighting_signature.highlight_style} highlights`;
    }
    
    if (!customElements || customElements.keepComposition) {
      dnaDescription += `\nCOMPOSITION: ${visualDNA.visual_dna.composition.layout} layout, ${visualDNA.visual_dna.composition.balance} balance, ${visualDNA.visual_dna.composition.negative_space} negative space, ${visualDNA.visual_dna.composition.depth_layers} depth`;
    }
    
    if (!customElements || customElements.keepTextures) {
      dnaDescription += `\nTEXTURES: ${visualDNA.visual_dna.texture_material.primary_textures.join(", ")}. Surface: ${visualDNA.visual_dna.texture_material.surface_quality}`;
    }

    dnaDescription += `\nTECHNICAL: ${visualDNA.visual_dna.technical_approach.medium}, ${visualDNA.visual_dna.technical_approach.lens_style} lens, ${visualDNA.visual_dna.technical_approach.processing} processing`;
    dnaDescription += `\nSIGNATURE ELEMENTS: ${visualDNA.signature_elements.join(", ")}`;

    const prompt = `${REMIX_GENERATOR_PROMPT}

EXTRACTED VISUAL DNA:
${dnaDescription}

NEW CONCEPT TO APPLY THIS STYLE TO:
${newConcept}

${styleModifier ? `ADDITIONAL STYLE MODIFIER: ${styleModifier}` : ""}

Create a prompt that reimagines "${newConcept}" in the visual style extracted above. The result should feel like it belongs to the same aesthetic universe as the reference.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      let cleanedText = text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      const remixResult = JSON.parse(cleanedText);
      return NextResponse.json({ remixResult });
    } catch (parseError) {
      return NextResponse.json({
        remixResult: {
          remix_prompt: text,
          style_notes: "Generated remix prompt",
          suggested_negative: ""
        }
      });
    }
  } catch (error) {
    console.error("Remix generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

