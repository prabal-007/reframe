import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, createImagePart, getMimeType } from "@/lib/gemini";
import { VISUAL_DNA_PROMPT } from "@/lib/remix-prompts";

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
      VISUAL_DNA_PROMPT,
      imagePart,
    ]);

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

      const visualDNA = JSON.parse(cleanedText);
      return NextResponse.json({ visualDNA });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse visual DNA", rawResponse: text },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Visual DNA extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extraction failed" },
      { status: 500 }
    );
  }
}

