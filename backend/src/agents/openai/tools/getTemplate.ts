import { tool } from '@openai/agents';
import Template from '../../../models/Template';

// Simple keyword overlap suggestion tool (matches structure of paletteTool)
export const getTemplateTool = tool({
  name: 'get_template',
  description: 'Suggest the most relevant existing design template for a user creation request. Returns { templateId, title, tags } or { templateId:null, reason }.',
  parameters: {
    type: 'object',
    properties: {
      prompt: { type: 'string', description: 'Raw user request describing the design they want to create.' }
    },
    required: ['prompt'],
    additionalProperties: false
  } as const,
  async execute(input: any) {
    const prompt: string = input.prompt;
    if (!prompt || typeof prompt !== 'string') {
      return { templateId: null, reason: 'invalid_prompt' };
    }

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const promptTokens = new Set(normalize(prompt).split(' ').filter(Boolean));
    const templates = await Template.find({});
    if (!templates.length) {
      return { templateId: null, reason: 'no_templates_available' };
    }

    let best: any = null; let bestScore = -Infinity;
    for (const t of templates) {
      const parts: string[] = [];
      if (t.title) parts.push(t.title);
      if (t.description) parts.push(t.description);
      if (Array.isArray(t.tags)) parts.push(t.tags.join(' '));
      const corpusTokens = normalize(parts.join(' ')).split(' ').filter(Boolean);
      let overlap = 0; corpusTokens.forEach(tok => { if (promptTokens.has(tok)) overlap++; });
      const coverage = overlap / Math.max(1, promptTokens.size);
      const score = overlap + coverage;
      if (score > bestScore) { bestScore = score; best = t; }
    }

    if (!best?._id) return { templateId: null, reason: 'no_match' };
    return { templateId: best._id.toString(), title: best.title, tags: best.tags };
  }
});
