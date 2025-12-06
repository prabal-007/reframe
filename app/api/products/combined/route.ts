import { NextRequest, NextResponse } from "next/server";
import { getTextModel } from "@/lib/gemini";
import { ProductAnalysis } from "@/lib/product-prompts";

const COMBINED_VARIATION_PROMPT = `You are an expert e-commerce product photographer. Generate an optimized image generation prompt that combines multiple variation changes for a product.

Given the product analysis and requested variations, create a detailed prompt that will:
1. Maintain the exact product shape, features, and composition
2. Apply ALL the requested variations together (color, material, AND/OR background)
3. Ensure visual consistency - the color should look natural on the material
4. Keep professional e-commerce photography standards

OUTPUT FORMAT:
Return ONLY a valid JSON object:

{
  "variation_prompt": "The complete image generation prompt combining all changes",
  "photography_notes": "Brief notes about how the changes work together",
  "suggested_filename": "descriptive-filename.jpg"
}`;

export async function POST(request: NextRequest) {
  try {
    const { productData, variations } = await request.json() as {
      productData: ProductAnalysis;
      variations: { color?: string; material?: string; background?: string };
    };

    if (!productData) {
      return NextResponse.json(
        { error: "Missing product data" },
        { status: 400 }
      );
    }

    if (!variations.color && !variations.material && !variations.background) {
      return NextResponse.json(
        { error: "At least one variation must be specified" },
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

    // Build variation description
    const variationParts = [];
    if (variations.color) variationParts.push(`Color: ${variations.color}`);
    if (variations.material) variationParts.push(`Material: ${variations.material}`);
    if (variations.background) variationParts.push(`Background: ${variations.background}`);

    const prompt = `${COMBINED_VARIATION_PROMPT}

PRODUCT ANALYSIS:
${JSON.stringify(productData, null, 2)}

REQUESTED COMBINED VARIATIONS:
${variationParts.join("\n")}

Generate a single prompt that applies ALL of these changes together, ensuring they work harmoniously. For example, if changing to "Rose Gold" color with "Brushed Metal" material, make sure the prompt describes a rose gold brushed metal finish.`;

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

      const variationResult = JSON.parse(cleanedText);
      return NextResponse.json({ variationResult });
    } catch (parseError) {
      // If JSON parsing fails, return the text as the prompt
      const filenameParts = [productData.product.name.toLowerCase().replace(/\s+/g, "-")];
      if (variations.color) filenameParts.push(variations.color.toLowerCase().replace(/\s+/g, "-"));
      if (variations.material) filenameParts.push(variations.material.toLowerCase().replace(/\s+/g, "-"));
      
      return NextResponse.json({
        variationResult: {
          variation_prompt: text,
          photography_notes: "Combined variation generated",
          suggested_filename: `${filenameParts.join("-")}.jpg`
        }
      });
    }
  } catch (error) {
    console.error("Combined variation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

