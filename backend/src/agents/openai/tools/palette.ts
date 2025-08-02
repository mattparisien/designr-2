import { tool } from '@openai/agents';
import { z } from 'zod';
export const paletteTool = tool({
  name: 'fetch_palette',
  description: 'Given a design goal, recommend a palette of hex colors.',
  parameters: z.object({
    goal: z.string().min(3),
    count: z.number().int().min(2).max(6).default(4),
  }),
  async execute({ goal, count }, context) {
    // e.g. look up from internal DB, or external API
    return {
      colors: new Array(count).fill(null).map((_, i) => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`),
      rationale: `Palette for "${goal}"`,
    };
  }
});
