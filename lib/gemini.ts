import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get Gemini 2.0 Flash model (free tier, fast, great at vision)
export const getVisionModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};

export const getTextModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};

// Get Gemini model for image generation
// Using gemini-2.0-flash-exp which supports native image generation
// See: https://developers.googleblog.com/experiment-with-gemini-20-flash-native-image-generation/
export const getImageGenerationModel = () => {
  return genAI.getGenerativeModel({ 
    model: process.env.GEMINI_GENERATION_MODEL || "gemini-2.0-flash-exp",
  });
};

// Convert base64 image to Gemini-compatible format
export const createImagePart = (base64Data: string, mimeType: string) => {
  // Remove data URL prefix if present
  const base64Content = base64Data.includes(",") 
    ? base64Data.split(",")[1] 
    : base64Data;
  
  return {
    inlineData: {
      data: base64Content,
      mimeType,
    },
  };
};

// Extract MIME type from data URL
export const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/data:([^;]+);/);
  return match ? match[1] : "image/jpeg";
};

