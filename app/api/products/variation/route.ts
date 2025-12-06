import { NextRequest, NextResponse } from "next/server";
import { getTextModel } from "@/lib/gemini";
import { VARIATION_GENERATOR_PROMPT, ProductAnalysis, VariationRequest } from "@/lib/product-prompts";

export async function POST(request: NextRequest) {
  try {
    const { productData, variation } = await request.json() as {
      productData: ProductAnalysis;
      variation: VariationRequest;
    };

    if (!productData || !variation) {
      return NextResponse.json(
        { error: "Missing product data or variation request" },
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

    const prompt = `${VARIATION_GENERATOR_PROMPT}

PRODUCT ANALYSIS:
${JSON.stringify(productData, null, 2)}

REQUESTED VARIATION:
Type: ${variation.type}
Value: ${variation.value}

Generate a prompt that creates the same product with the ${variation.type} changed to "${variation.value}".`;

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
      return NextResponse.json({
        variationResult: {
          variation_prompt: text,
          photography_notes: "Generated from AI",
          suggested_filename: `${productData.product.name.toLowerCase().replace(/\s+/g, "-")}-${variation.value.toLowerCase().replace(/\s+/g, "-")}.jpg`
        }
      });
    }
  } catch (error) {
    console.error("Variation generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

