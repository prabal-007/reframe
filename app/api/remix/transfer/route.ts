import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, getTextModel, createImagePart, getMimeType } from "@/lib/gemini";
import { VisualDNA } from "@/lib/remix-prompts";

const TARGET_ANALYSIS_PROMPT = `Analyze this target image and describe its CONTENT (not style). Focus on:
- Main subjects and their positions
- Actions/poses
- Environment/setting
- Key objects and their arrangement
- Any text or signage

OUTPUT FORMAT (JSON):
{
  "subject": "Main subject description",
  "setting": "Environment/location description", 
  "composition": "How elements are arranged",
  "key_elements": ["element1", "element2", "element3"],
  "mood_content": "The narrative/story of the image (not visual style)"
}`;

const STYLE_TRANSFER_PROMPT = `You are creating an image generation prompt that applies a specific visual style to new content.

Your task: Create a prompt that describes the TARGET IMAGE's CONTENT but rendered in the REFERENCE IMAGE's STYLE.

Think of it as: "Paint THIS scene in THAT style"

Rules:
1. Keep ALL content from the target (subjects, setting, arrangement, story)
2. Apply ALL style elements from the reference (colors, lighting, mood, composition style, technical approach)
3. The result should look like the same scene/subject but photographed/rendered in a completely different visual style
4. Be specific about how the style transforms the content

OUTPUT FORMAT (JSON):
{
  "transfer_prompt": "Complete prompt combining target content with reference style",
  "style_application_notes": "How the reference style transforms the target",
  "before_after_summary": "Brief description of the transformation"
}`;

export async function POST(request: NextRequest) {
  try {
    const { visualDNA, targetImage, customElements } = await request.json() as {
      visualDNA: VisualDNA;
      targetImage: string;
      customElements?: {
        keepColors: boolean;
        keepLighting: boolean;
        keepComposition: boolean;
        keepMood: boolean;
        keepTextures: boolean;
      };
    };

    if (!visualDNA || !targetImage) {
      return NextResponse.json(
        { error: "Missing visual DNA or target image" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const visionModel = getVisionModel();
    const textModel = getTextModel();
    const mimeType = getMimeType(targetImage);
    const targetImagePart = createImagePart(targetImage, mimeType);

    // Step 1: Analyze target image content
    const targetResult = await visionModel.generateContent([
      TARGET_ANALYSIS_PROMPT,
      targetImagePart,
    ]);

    let targetAnalysis;
    try {
      let targetText = targetResult.response.text().trim();
      if (targetText.startsWith("```json")) targetText = targetText.slice(7);
      if (targetText.startsWith("```")) targetText = targetText.slice(3);
      if (targetText.endsWith("```")) targetText = targetText.slice(0, -3);
      targetAnalysis = JSON.parse(targetText.trim());
    } catch {
      targetAnalysis = {
        subject: "The subject from the uploaded image",
        setting: "The environment shown",
        composition: "As composed in the image",
        key_elements: [],
        mood_content: "The scene as presented"
      };
    }

    // Step 2: Build style description from visual DNA
    let styleDescription = "";
    const elements = customElements || {
      keepColors: true,
      keepLighting: true,
      keepComposition: true,
      keepMood: true,
      keepTextures: true,
    };

    if (elements.keepMood) {
      styleDescription += `STYLE & MOOD: ${visualDNA.visual_dna.style_mood.primary_style}, ${visualDNA.visual_dna.style_mood.mood}, ${visualDNA.visual_dna.style_mood.era_influence} influence. Keywords: ${visualDNA.visual_dna.style_mood.descriptors.join(", ")}\n`;
    }
    
    if (elements.keepColors) {
      styleDescription += `COLORS: ${visualDNA.visual_dna.color_theory.palette_type} palette, ${visualDNA.visual_dna.color_theory.saturation} saturation, ${visualDNA.visual_dna.color_theory.temperature} temperature, ${visualDNA.visual_dna.color_theory.contrast} contrast. Dominant: ${visualDNA.visual_dna.color_theory.dominant_colors.join(", ")}\n`;
    }
    
    if (elements.keepLighting) {
      styleDescription += `LIGHTING: ${visualDNA.visual_dna.lighting_signature.key_light} light, ${visualDNA.visual_dna.lighting_signature.direction} direction, ${visualDNA.visual_dna.lighting_signature.shadow_quality} shadows, ${visualDNA.visual_dna.lighting_signature.highlight_style} highlights\n`;
    }
    
    if (elements.keepTextures) {
      styleDescription += `TEXTURES: ${visualDNA.visual_dna.texture_material.primary_textures.join(", ")}, ${visualDNA.visual_dna.texture_material.surface_quality} surfaces\n`;
    }

    styleDescription += `TECHNICAL: ${visualDNA.visual_dna.technical_approach.medium}, ${visualDNA.visual_dna.technical_approach.lens_style} lens, ${visualDNA.visual_dna.technical_approach.processing} processing\n`;
    styleDescription += `SIGNATURE: ${visualDNA.signature_elements.join(", ")}`;

    // Step 3: Generate transfer prompt
    const transferPrompt = `${STYLE_TRANSFER_PROMPT}

TARGET IMAGE CONTENT:
Subject: ${targetAnalysis.subject}
Setting: ${targetAnalysis.setting}
Composition: ${targetAnalysis.composition}
Key Elements: ${targetAnalysis.key_elements.join(", ")}
Scene: ${targetAnalysis.mood_content}

REFERENCE STYLE TO APPLY:
${styleDescription}

Create a prompt that renders the TARGET content in the REFERENCE style. The output should describe the same scene/subject but completely transformed by the reference's visual language.`;

    const result = await textModel.generateContent(transferPrompt);
    const text = result.response.text();

    try {
      let cleanedText = text.trim();
      if (cleanedText.startsWith("```json")) cleanedText = cleanedText.slice(7);
      if (cleanedText.startsWith("```")) cleanedText = cleanedText.slice(3);
      if (cleanedText.endsWith("```")) cleanedText = cleanedText.slice(0, -3);
      
      const transferResult = JSON.parse(cleanedText.trim());
      return NextResponse.json({ 
        transferResult,
        targetAnalysis 
      });
    } catch {
      return NextResponse.json({
        transferResult: {
          transfer_prompt: text,
          style_application_notes: "Style transfer generated",
          before_after_summary: `${targetAnalysis.subject} reimagined in ${visualDNA.visual_dna.style_mood.primary_style} style`
        },
        targetAnalysis
      });
    }
  } catch (error) {
    console.error("Style transfer error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transfer failed" },
      { status: 500 }
    );
  }
}

