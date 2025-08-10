import { Agent } from '@openai/agents';
import { DESIGN_AGENT_INSTRUCTIONS, LAYOUT_AGENT_INSTRUCTIONS, BRANDING_AGENT_INSTRUCTIONS } from './constants';
import { paletteTool } from './tools/palette';

export const layoutAgent = new Agent({
  name: 'Layout Expert',
  handoffDescription: 'Handles layout, grid, spacing, and component hierarchy in design',
  instructions: LAYOUT_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
});


export const brandingAgent = new Agent({
  name: 'Branding Specialist',
  handoffDescription: 'Handles branding-related tasks: logo directions, palettes, typography, voice & tone',
  instructions: BRANDING_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
});


export const designAgent = new Agent({
  name: 'Design Assistant',
  handoffs: [
    layoutAgent,
    brandingAgent,
  ],
  instructions: DESIGN_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o',
  modelSettings: { temperature: 0.7 },
});
