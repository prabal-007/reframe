import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, createImagePart, getMimeType } from "@/lib/gemini";
import { CATALOG_PROMPT } from "@/lib/catalog-prompts";

export async function POST(request: NextRequest) {
  try {
    const { image, filename } = await request.json();

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
      CATALOG_PROMPT,
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

      const metadata = JSON.parse(cleanedText);
      
      return NextResponse.json({ 
        entry: {
          id: Date.now().toString(),
          filename: filename || "untitled",
          thumbnail: image,
          metadata,
          catalogedAt: new Date().toISOString()
        }
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse catalog metadata", rawResponse: text },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Catalog error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cataloging failed" },
      { status: 500 }
    );
  }
}






