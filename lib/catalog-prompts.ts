// Image Cataloging - Auto-tag and create searchable metadata

export const CATALOG_PROMPT = `You are an expert image cataloger and metadata specialist. Analyze this image and generate comprehensive, searchable metadata for a digital asset management system.

Generate thorough metadata covering:

1. **Core Classification**: Primary category, subcategories, content type
2. **Tags**: Extensive keyword tags for search (aim for 15-30 relevant tags)
3. **Visual Elements**: Colors, objects, people, text, shapes
4. **Context**: Setting, time, mood, season, occasion
5. **Technical**: Image type, orientation, composition style
6. **Usage Rights Hints**: Model release needs, recognizable brands/locations

OUTPUT FORMAT (STRICT JSON):
{
  "classification": {
    "primary_category": "Nature/People/Architecture/Food/Product/Abstract/etc",
    "subcategories": ["subcategory1", "subcategory2"],
    "content_type": "Photo/Illustration/Screenshot/Graphic/etc",
    "orientation": "Landscape/Portrait/Square",
    "aspect_ratio": "16:9/4:3/1:1/etc"
  },
  "tags": {
    "primary": ["most relevant tag 1", "tag 2", "tag 3"],
    "secondary": ["additional tag 1", "tag 2", "tag 3", "..."],
    "style": ["style descriptors"],
    "mood": ["mood/emotion tags"],
    "color": ["color tags"]
  },
  "visual_elements": {
    "dominant_colors": [
      {"name": "Color Name", "hex": "#RRGGBB", "percentage": 30}
    ],
    "objects": ["object1", "object2", "object3"],
    "people": {
      "count": 0,
      "descriptions": ["person 1 description if any"],
      "activities": ["what they're doing"]
    },
    "text_detected": ["any text in image"],
    "brands_logos": ["any visible brands"]
  },
  "context": {
    "setting": "Indoor/Outdoor/Studio/etc",
    "location_type": "Urban/Rural/Beach/Office/Home/etc",
    "time_of_day": "Morning/Afternoon/Evening/Night/Unknown",
    "season": "Spring/Summer/Fall/Winter/Unknown",
    "weather": "Sunny/Cloudy/Rainy/etc or N/A",
    "occasion": "Business/Casual/Holiday/Wedding/etc or General",
    "era_style": "Contemporary/Vintage/Retro/Futuristic/Timeless"
  },
  "mood_atmosphere": {
    "primary_mood": "Happy/Serious/Calm/Energetic/Mysterious/etc",
    "emotional_tone": ["emotion1", "emotion2"],
    "energy_level": "High/Medium/Low/Calm"
  },
  "technical": {
    "photography_style": "Portrait/Landscape/Macro/Aerial/Street/etc",
    "lighting": "Natural/Studio/Mixed/Low-light",
    "focus": "Sharp/Soft/Selective",
    "composition": "Centered/Rule-of-thirds/Symmetrical/Dynamic"
  },
  "usage_hints": {
    "suitable_for": ["Website hero", "Social media", "Print", "Editorial"],
    "model_release_likely_needed": true/false,
    "property_release_likely_needed": true/false,
    "commercial_considerations": "Any notes about usage"
  },
  "seo": {
    "title": "SEO-friendly title (50-60 chars)",
    "description": "SEO meta description (150-160 chars)",
    "alt_text": "Accessible alt text (under 125 chars)"
  }
}

GUIDELINES:
- Generate as many relevant tags as possible (search depends on this)
- Be specific: "golden retriever" not just "dog"
- Include both general and specific terms
- Consider what someone might search for to find this image
- Note any potentially restricted content (faces, brands, locations)`;

export interface ColorInfo {
  name: string;
  hex: string;
  percentage: number;
}

export interface CatalogMetadata {
  classification: {
    primary_category: string;
    subcategories: string[];
    content_type: string;
    orientation: string;
    aspect_ratio: string;
  };
  tags: {
    primary: string[];
    secondary: string[];
    style: string[];
    mood: string[];
    color: string[];
  };
  visual_elements: {
    dominant_colors: ColorInfo[];
    objects: string[];
    people: {
      count: number;
      descriptions: string[];
      activities: string[];
    };
    text_detected: string[];
    brands_logos: string[];
  };
  context: {
    setting: string;
    location_type: string;
    time_of_day: string;
    season: string;
    weather: string;
    occasion: string;
    era_style: string;
  };
  mood_atmosphere: {
    primary_mood: string;
    emotional_tone: string[];
    energy_level: string;
  };
  technical: {
    photography_style: string;
    lighting: string;
    focus: string;
    composition: string;
  };
  usage_hints: {
    suitable_for: string[];
    model_release_likely_needed: boolean;
    property_release_likely_needed: boolean;
    commercial_considerations: string;
  };
  seo: {
    title: string;
    description: string;
    alt_text: string;
  };
}

export interface CatalogEntry {
  id: string;
  filename: string;
  thumbnail: string;
  metadata: CatalogMetadata;
  catalogedAt: string;
}

// Export format options
export type ExportFormat = "json" | "csv" | "keywords";

export const formatForExport = (entries: CatalogEntry[], format: ExportFormat): string => {
  switch (format) {
    case "json":
      return JSON.stringify(entries.map(e => ({
        filename: e.filename,
        ...e.metadata
      })), null, 2);
    
    case "csv":
      const headers = [
        "Filename",
        "Category",
        "Subcategories",
        "Primary Tags",
        "All Tags",
        "Colors",
        "Objects",
        "Setting",
        "Mood",
        "SEO Title",
        "Alt Text"
      ];
      const rows = entries.map(e => [
        e.filename,
        e.metadata.classification.primary_category,
        e.metadata.classification.subcategories.join("; "),
        e.metadata.tags.primary.join("; "),
        [...e.metadata.tags.primary, ...e.metadata.tags.secondary].join("; "),
        e.metadata.visual_elements.dominant_colors.map(c => c.name).join("; "),
        e.metadata.visual_elements.objects.join("; "),
        e.metadata.context.setting,
        e.metadata.mood_atmosphere.primary_mood,
        e.metadata.seo.title,
        e.metadata.seo.alt_text
      ]);
      return [headers.join(","), ...rows.map(r => r.map(cell => `"${cell}"`).join(","))].join("\n");
    
    case "keywords":
      return entries.map(e => {
        const allTags = [
          ...e.metadata.tags.primary,
          ...e.metadata.tags.secondary,
          ...e.metadata.tags.style,
          ...e.metadata.tags.mood,
          ...e.metadata.tags.color
        ];
        return `${e.filename}:\n${allTags.join(", ")}`;
      }).join("\n\n");
    
    default:
      return "";
  }
};










