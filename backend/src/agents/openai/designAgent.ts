import { Agent } from '@openai/agents';
import { SYSTEM_PROMPT } from './constants';
import { domainGuardrail } from './guardrails/domain';
import { paletteTool } from './tools/palette';

const BRANDING_AGENT_INSTRUCTIONS = SYSTEM_PROMPT;

export const brandingAgent = new Agent({
  name: 'Branding Specialist',
  handoffDescription: 'Handles branding-related design tasks like logo, color, tone of voice',
  instructions: BRANDING_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
  // inputGuardrails: [domainGuardrail],
});

const LAYOUT_AGENT_INSTRUCTIONS = `
You are the Layout & Composition Expert agent 📐. 
When the task is related to page hierarchy, UI components, or visual layout,
please:
  • propose 2–3 layout wireframes (brief text)  
  • recommend spacing, alignment, scale rules  
  • use UX patterns & design rhythm  
Always sign off as Layout Expert.
`.trim();

export const layoutAgent = new Agent({
  name: 'Layout Expert',
  handoffDescription: 'Handles layout, grid, spacing, and component hierarchy in design',
  instructions: LAYOUT_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
  // inputGuardrails: [domainGuardrail],
});

const DESIGN_AGENT_INSTRUCTIONS = `
You are the Design Assistant 🧠 for visual aid.  
- Determine whether the user needs **branding** or **layout** help.  
- If ambiguous, ask a follow-up question.  
- Otherwise, **handoff** to the relevant specialist agent.
`.trim();

export const designAgent = new Agent({
  name: 'Design Assistant',
  handoffs: [
    brandingAgent,
    layoutAgent
  ],
  instructions: DESIGN_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o',
  modelSettings: { temperature: 0.7 },
  // inputGuardrails: [domainGuardrail],
});
