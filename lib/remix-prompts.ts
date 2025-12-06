// Creative Remix - Extract visual DNA and generate inspired variations

export const VISUAL_DNA_PROMPT = `You are a creative director and visual analyst. Extract the "Visual DNA" from this image - the core stylistic elements that define its aesthetic identity.

Analyze and extract:

1. **Style & Mood**: The overall artistic direction, emotional tone, and visual language
2. **Color Theory**: Color relationships, dominant hues, accent usage, saturation levels
3. **Composition**: Layout principles, balance, focal points, use of space
4. **Lighting Signature**: Light quality, direction, contrast ratio, shadow character
5. **Texture & Material Language**: Surface qualities, tactile impressions
6. **Visual Motifs**: Recurring elements, patterns, symbolic imagery
7. **Technical Approach**: Photography/art style, lens characteristics, post-processing

OUTPUT FORMAT (STRICT JSON):
Return ONLY a valid JSON object:

{
  "visual_dna": {
    "style_mood": {
      "primary_style": "Minimalist/Maximalist/Vintage/Futuristic/Organic/Industrial/etc",
      "mood": "Serene/Energetic/Mysterious/Playful/Luxurious/Raw/etc",
      "era_influence": "70s/80s/90s/Y2K/Contemporary/Timeless/etc",
      "descriptors": ["word1", "word2", "word3"]
    },
    "color_theory": {
      "palette_type": "Monochromatic/Complementary/Analogous/Triadic/etc",
      "dominant_colors": ["#hex1", "#hex2"],
      "accent_colors": ["#hex1"],
      "saturation": "Muted/Vibrant/Desaturated",
      "temperature": "Warm/Cool/Neutral",
      "contrast": "High/Medium/Low"
    },
    "composition": {
      "layout": "Centered/Rule-of-thirds/Symmetrical/Asymmetrical/Dynamic",
      "balance": "Balanced/Tension/Flowing",
      "negative_space": "Minimal/Generous/Strategic",
      "depth_layers": "Flat/Layered/Deep"
    },
    "lighting_signature": {
      "key_light": "Natural/Studio/Dramatic/Soft/Hard",
      "direction": "Front/Side/Back/Top/Rim",
      "shadow_quality": "Soft/Hard/Absent",
      "highlight_style": "Specular/Diffused/Glowing"
    },
    "texture_material": {
      "primary_textures": ["texture1", "texture2"],
      "surface_quality": "Glossy/Matte/Rough/Smooth/Mixed",
      "material_palette": ["material1", "material2"]
    },
    "visual_motifs": ["motif1", "motif2", "motif3"],
    "technical_approach": {
      "medium": "Photography/3D Render/Illustration/Mixed Media",
      "lens_style": "Wide/Standard/Telephoto/Macro/Fisheye",
      "processing": "Clean/Film grain/High contrast/Dreamy/etc"
    }
  },
  "signature_elements": [
    "The single most defining visual element",
    "Second most important element",
    "Third key element"
  ],
  "remix_potential": {
    "adaptable_to": ["Product photography", "Portrait", "Landscape", "Abstract"],
    "key_transferable": "The core aesthetic that can be applied to other subjects"
  }
}`;

export const REMIX_GENERATOR_PROMPT = `You are a creative director generating image prompts that apply extracted "Visual DNA" to new concepts.

Your task: Take the visual DNA from a reference image and apply it to a completely new subject/concept while maintaining the aesthetic essence.

Rules:
1. Preserve the STYLE and MOOD, not the literal content
2. Apply the color theory, lighting signature, and composition principles
3. Translate visual motifs into relevant equivalents for the new subject
4. Maintain the technical approach and processing style
5. Create a cohesive prompt that feels like it belongs to the same "visual universe"

OUTPUT FORMAT (JSON):
{
  "remix_prompt": "Complete image generation prompt applying the visual DNA to the new concept",
  "style_notes": "How the key visual elements were translated",
  "suggested_negative": "Elements to avoid to maintain style purity"
}`;

export interface VisualDNA {
  visual_dna: {
    style_mood: {
      primary_style: string;
      mood: string;
      era_influence: string;
      descriptors: string[];
    };
    color_theory: {
      palette_type: string;
      dominant_colors: string[];
      accent_colors: string[];
      saturation: string;
      temperature: string;
      contrast: string;
    };
    composition: {
      layout: string;
      balance: string;
      negative_space: string;
      depth_layers: string;
    };
    lighting_signature: {
      key_light: string;
      direction: string;
      shadow_quality: string;
      highlight_style: string;
    };
    texture_material: {
      primary_textures: string[];
      surface_quality: string;
      material_palette: string[];
    };
    visual_motifs: string[];
    technical_approach: {
      medium: string;
      lens_style: string;
      processing: string;
    };
  };
  signature_elements: string[];
  remix_potential: {
    adaptable_to: string[];
    key_transferable: string;
  };
}

export interface RemixResult {
  remix_prompt: string;
  style_notes: string;
  suggested_negative: string;
}

// Preset concepts for quick remixing
export const REMIX_CONCEPTS = [
  { category: "Products", items: ["Perfume bottle", "Sneakers", "Headphones", "Watch", "Sunglasses", "Handbag"] },
  { category: "Food & Drink", items: ["Coffee cup", "Cocktail", "Dessert", "Fresh fruit", "Gourmet dish"] },
  { category: "Nature", items: ["Mountain landscape", "Ocean waves", "Forest path", "Desert dunes", "Flower close-up"] },
  { category: "Architecture", items: ["Modern building", "Ancient ruins", "Cozy interior", "Urban street", "Staircase"] },
  { category: "Portrait", items: ["Fashion portrait", "Character study", "Silhouette", "Environmental portrait"] },
  { category: "Abstract", items: ["Geometric shapes", "Fluid forms", "Light trails", "Texture study", "Color field"] },
];

// Style presets that can be mixed with extracted DNA
export const STYLE_MODIFIERS = [
  { name: "Cinematic", prompt: "cinematic lighting, dramatic shadows, film grain, anamorphic lens flare" },
  { name: "Editorial", prompt: "high fashion editorial, clean lines, intentional negative space, sophisticated" },
  { name: "Dreamy", prompt: "soft focus, ethereal glow, pastel tones, romantic atmosphere" },
  { name: "Bold & Graphic", prompt: "strong contrast, bold colors, graphic composition, impactful" },
  { name: "Vintage Film", prompt: "35mm film aesthetic, warm tones, subtle grain, nostalgic" },
  { name: "Futuristic", prompt: "sleek surfaces, neon accents, sci-fi atmosphere, technological" },
  { name: "Organic Natural", prompt: "earth tones, natural textures, soft daylight, authentic" },
  { name: "Dark Moody", prompt: "low key lighting, deep shadows, mysterious, atmospheric" },
];

