import { Agent } from '@openai/agents';
import { DESIGN_AGENT_INSTRUCTIONS, LAYOUT_AGENT_INSTRUCTIONS } from './constants';
import { paletteTool } from './tools/palette';

const BRANDING_AGENT_INSTRUCTIONS = SYSTEM_PROMPT;

// export const brandingAgent = new Agent({
//   name: 'Branding Specialist',
//   handoffDescription: 'Handles branding-related design tasks like logo, color, tone of voice',
//   instructions: BRANDING_AGENT_INSTRUCTIONS,
//   tools: [paletteTool],
//   model: 'gpt-4o-mini',
//   modelSettings: { temperature: 0.6 },
//   // inputGuardrails: [domainGuardrail],
// });


export const layoutAgent = new Agent({
  name: 'Layout Expert',
  handoffDescription: 'Handles layout, grid, spacing, and component hierarchy in design',
  instructions: LAYOUT_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
  // inputGuardrails: [domainGuardrail],
});


export const designAgent = new Agent({
  name: 'Design Assistant',
  handoffs: [
    layoutAgent
  ],
  instructions: DESIGN_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o',
  modelSettings: { temperature: 0.7 },
  // inputGuardrails: [domainGuardrail],
});
