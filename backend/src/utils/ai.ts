import { DesignElement } from "@shared/types";
import OpenAI from "openai";

interface AIGenerationResult {
  description: string;
  tags: string[];
}

interface TemplateAnalysis {
  title: string;
  category: string;
  currentDescription?: string;
  currentTags?: string[];
  canvasSize?: { width: number; height: number };
  pages: Array<{
    id: string;
    elementCount: number;
    elements: any[];
    backgroundColor?: string;
    canvasSize?: { width: number; height: number };
  }>;
}

// ────────────────────────────────────────────────────────────────
// Lazy OpenAI client
// ────────────────────────────────────────────────────────────────
let openai: OpenAI | null = null;
export function getClient() {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  openai = new OpenAI({ apiKey: key });
  return openai;
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
/** Safely pull plain-text from a Responses API call */
export function extractText(res: any): string {
  // If sdk >= 0.21 has .output_text shortcut use it
  // otherwise fall back to first content chunk
  let raw = (
    res.output_text ??
    res.output?.[0]?.content?.[0]?.text ??
    JSON.stringify(res.output)
  );
  
  // Clean up markdown code blocks if present
  if (typeof raw === 'string') {
    // Remove markdown code block syntax
    raw = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    // Also handle cases where it might just be ```
    raw = raw.replace(/^```\s*/, '').replace(/\s*```$/, '');
    // Trim any extra whitespace
    raw = raw.trim();
  }
  
  return raw;
}

export const generateDescriptionAndTags = async (template: any): Promise<AIGenerationResult> => {
  const client = getClient();
  if (!client) throw new Error('AI client unavailable');
  
  // Extract detailed information about the template elements
  const extractElementDetails = (elements: DesignElement[]) => {
    return elements.map(element => {
      const details: any = {
        type: element.type,
        id: element.id,
        position: { x: element.rect.x, y: element.rect.y },
        size: { width: element.rect.width, height: element.rect.height }
      };
      
      // Add specific properties based on element type
      if (element.type === 'text') {
        details.content = element.content;
        details.fontSize = element.fontSize;
        details.fontFamily = element.fontFamily;
        details.color = element.color;
        details.textAlign = element.textAlign;
        details.isBold = element.isBold;
        details.isItalic = element.isItalic;
      }
      
      if (element.type === 'shape') {
        details.form = element.form;
        details.backgroundColor = element.backgroundColor;
        details.borderColor = element.borderColor;
        details.borderWidth = element.borderWidth;
      }
      
      if (element.type === 'image') {
        details.src = element.src;
        details.alt = element.alt;
      }
      
      if (element.type === 'line') {
        details.backgroundColor = element.backgroundColor;
        details.width = element.width;
      }
      
      return details;
    });
  };
  
  // Build comprehensive template analysis
  const templateAnalysis: TemplateAnalysis = {
    title: template.title,
    category: template.category,
    currentDescription: template.description,
    currentTags: template.tags,
    canvasSize: template.canvasSize,
    pages: template.pages.map((page: any) => ({
      id: page.id,
      elementCount: page.canvas?.elements?.length || 0,
      elements: extractElementDetails(page.canvas?.elements || []),
      backgroundColor: page.canvas?.backgroundColor,
      canvasSize: page.canvas?.canvasSize
    }))
  };
  
  const systemPrompt = `You are an AI assistant that analyzes design templates and generates concise, SEO-friendly descriptions and relevant tags. 

Based on the template data provided, analyze:
1. The visual elements (text, images, shapes, colors, layout)
2. The design style and aesthetic
3. The intended use case and target audience
4. Color scheme and typography choices
5. Overall composition and layout structure

IMPORTANT: Return ONLY a valid JSON object with no markdown formatting, code blocks, or additional text. The response must be pure JSON that can be parsed directly.

Generate a JSON response with:
- "description": A compelling, descriptive summary (2-3 sentences) that highlights the template's key features, style, and use case
- "tags": An array of 5-8 relevant tags covering style, colors, use case, industry, and design elements

Make the description engaging and the tags specific and searchable.

Example response format:
{"description": "A modern and professional business card template featuring clean typography and a minimalist design.", "tags": ["business", "professional", "minimalist", "clean", "corporate"]}`;
  
  const userContent = JSON.stringify(templateAnalysis, null, 2);

  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ]
  });
  
  const raw = extractText(response);
  let aiResult: any;
  
  try {
    aiResult = JSON.parse(raw);
  } catch (parseError) {
    console.error('Raw AI response:', raw);
    console.error('Parse error:', parseError);
    throw new Error(`Failed to parse AI response: ${parseError}`);
  }
  
  if (!aiResult.description || !Array.isArray(aiResult.tags)) {
    console.error('Invalid AI result structure:', aiResult);
    throw new Error('AI response missing required fields: description and tags');
  }
  
  return { 
    description: aiResult.description, 
    tags: aiResult.tags 
  };
};
