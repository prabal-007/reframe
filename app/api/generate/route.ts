import { NextRequest, NextResponse } from "next/server";
import { getTextModel } from "@/lib/gemini";
import { VISION_FORGE_PROMPT } from "@/lib/prompts";
import { VisionStructOutput } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { sceneData } = await request.json() as { sceneData: VisionStructOutput };

    if (!sceneData) {
      return NextResponse.json(
        { error: "No scene data provided" },
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

    const prompt = `${VISION_FORGE_PROMPT}

Here is the JSON blueprint to convert into an image generation prompt:

${JSON.stringify(sceneData, null, 2)}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract the prompt from the response (it should be in a code block)
    let generatedPrompt = text;
    
    // Try to extract just the prompt part from code blocks
    const codeBlockMatch = text.match(/```(?:[\w]*\n)?([\s\S]*?)```/);
    if (codeBlockMatch) {
      generatedPrompt = codeBlockMatch[1].trim();
    }

    return NextResponse.json({ 
      prompt: generatedPrompt,
      fullResponse: text 
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Prompt generation failed" },
      { status: 500 }
    );
  }
}

