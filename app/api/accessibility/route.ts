import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, createImagePart, getMimeType } from "@/lib/gemini";
import { ALT_TEXT_PROMPT } from "@/lib/accessibility-prompts";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = getVisionModel();
    const mimeType = getMimeType(image);
    const imagePart = createImagePart(image, mimeType);

    const result = await model.generateContent([
      ALT_TEXT_PROMPT,
      imagePart,
    ]);

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
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

      const accessibilityData = JSON.parse(cleanedText);
      return NextResponse.json({ accessibilityData });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse accessibility data", rawResponse: text },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Accessibility analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

