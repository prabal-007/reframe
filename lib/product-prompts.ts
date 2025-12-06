// Product photo analysis and variation prompts

export const PRODUCT_ANALYSIS_PROMPT = `You are a professional e-commerce product photographer assistant. Analyze the provided product image and extract detailed information for generating variations.

OUTPUT FORMAT (STRICT JSON):
Return ONLY a valid JSON object with no markdown fencing:

{
  "product": {
    "name": "Identified product name",
    "category": "Electronics/Clothing/Furniture/Food/Cosmetics/Accessories/etc",
    "current_color": "Primary color of the product",
    "current_material": "Material appearance (leather, plastic, metal, fabric, wood, etc)",
    "shape": "General shape description",
    "key_features": ["Feature 1", "Feature 2", "Feature 3"]
  },
  "photography": {
    "background_type": "Solid/Gradient/Lifestyle/Studio/Outdoor",
    "background_color": "Current background color",
    "lighting_style": "Soft/Hard/Natural/Studio/Dramatic",
    "angle": "Front/Side/Top-down/45-degree/Hero shot",
    "shadows": "None/Soft/Hard/Reflection"
  },
  "suggested_variations": {
    "colors": ["Color 1", "Color 2", "Color 3", "Color 4", "Color 5"],
    "materials": ["Material 1", "Material 2", "Material 3"],
    "backgrounds": ["Background 1", "Background 2", "Background 3"],
    "seasonal": ["Spring/Summer version", "Fall/Winter version", "Holiday edition"]
  },
  "base_prompt": "A detailed base prompt describing the product photography that can be modified for variations"
}

GUIDELINES:
- Suggest colors that are commercially popular for this product category
- Material suggestions should be realistic for the product type
- Background suggestions should suit e-commerce standards
- Base prompt should capture all visual details needed for accurate recreation`;

export const VARIATION_GENERATOR_PROMPT = `You are an expert e-commerce product photographer. Generate an optimized image generation prompt for a product variation.

Given the product analysis and requested variation, create a detailed prompt that will:
1. Maintain the exact product shape, features, and composition
2. Apply the requested variation (color/material/background)
3. Keep professional e-commerce photography standards
4. Ensure consistency suitable for product catalogs

OUTPUT FORMAT:
Return ONLY a valid JSON object:

{
  "variation_prompt": "The complete image generation prompt",
  "photography_notes": "Brief notes about lighting/angle adjustments for this variation",
  "suggested_filename": "suggested-filename-for-this-variation.jpg"
}`;

export interface ProductAnalysis {
  product: {
    name: string;
    category: string;
    current_color: string;
    current_material: string;
    shape: string;
    key_features: string[];
  };
  photography: {
    background_type: string;
    background_color: string;
    lighting_style: string;
    angle: string;
    shadows: string;
  };
  suggested_variations: {
    colors: string[];
    materials: string[];
    backgrounds: string[];
    seasonal: string[];
  };
  base_prompt: string;
}

export interface VariationResult {
  variation_prompt: string;
  photography_notes: string;
  suggested_filename: string;
}

export type VariationType = "color" | "material" | "background" | "seasonal";

export interface VariationRequest {
  type: VariationType;
  value: string;
}

// Predefined color palettes for quick selection
export const COLOR_PALETTES = {
  neutrals: ["Pure White", "Ivory", "Charcoal Gray", "Matte Black", "Beige"],
  vibrant: ["Cherry Red", "Ocean Blue", "Emerald Green", "Sunshine Yellow", "Electric Purple"],
  pastels: ["Blush Pink", "Baby Blue", "Mint Green", "Lavender", "Peach"],
  earth: ["Terracotta", "Olive Green", "Rust Orange", "Chocolate Brown", "Sand"],
  metallics: ["Gold", "Silver", "Rose Gold", "Bronze", "Copper"],
};

export const BACKGROUND_PRESETS = [
  { name: "Pure White Studio", value: "pure white seamless studio background, soft diffused lighting" },
  { name: "Gradient Gray", value: "smooth gray gradient background, professional product photography" },
  { name: "Lifestyle Wood", value: "natural wood surface, lifestyle product shot, warm ambient lighting" },
  { name: "Marble Elegance", value: "white marble surface with subtle veining, luxury product presentation" },
  { name: "Nature Scene", value: "soft natural outdoor background with bokeh, organic lifestyle setting" },
  { name: "Minimalist Black", value: "matte black background, dramatic lighting, premium product shot" },
];

export const MATERIAL_OPTIONS = [
  "Genuine Leather",
  "Vegan Leather",
  "Brushed Metal",
  "Polished Chrome",
  "Matte Plastic",
  "Natural Wood",
  "Recycled Materials",
  "Premium Fabric",
  "Transparent/Clear",
  "Carbon Fiber",
];

