import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, createImagePart, getMimeType } from "@/lib/gemini";
import { VISION_STRUCT_PROMPT } from "@/lib/prompts";

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
      VISION_STRUCT_PROMPT,
      imagePart,
    ]);

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    try {
      // Clean up potential markdown fencing
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

      const sceneData = JSON.parse(cleanedText);
      return NextResponse.json({ sceneData });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", text);
      return NextResponse.json(
        { error: "Failed to parse scene analysis", rawResponse: text },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

