import { Agent, AgentInputItem, run } from '@openai/agents';
import { DESIGN_AGENT_INSTRUCTIONS, DESIGN_TRIAGE_AGENT_INSTRUCTIONS, LAYOUT_AGENT_INSTRUCTIONS, BRANDING_AGENT_INSTRUCTIONS } from './constants';
import { paletteTool } from './tools/palette';
import { templateSuggestTool } from './tools/templateSuggest';
import { createBrandTool } from './tools/createBrand';

export const layoutAgent = new Agent({
  name: 'Layout Expert',
  handoffDescription: 'Handles layout, grid, spacing, and component hierarchy in design',
  instructions: LAYOUT_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
  // inputGuardrails: [domainGuardrail],
});


export const brandingAgent = new Agent({
  name: 'Branding Specialist',
  handoffDescription: 'Handles branding-related tasks: logo directions, palettes, typography, voice & tone',
  instructions: BRANDING_AGENT_INSTRUCTIONS,
  tools: [paletteTool, createBrandTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
  // inputGuardrails: [domainGuardrail],
});

export const designAgent = new Agent({
  name: 'Design Assistant',
  instructions: DESIGN_AGENT_INSTRUCTIONS,
  tools: [paletteTool, templateSuggestTool, createBrandTool],
  // inputGuardrails: [domainGuardrail],
  handoffs: [layoutAgent, brandingAgent],  // sub-agents for specialization
  modelSettings: { temperature: 0.6 },
  toolUseBehavior: 'run_llm_again',
});

export const designTriageAgent = new Agent({
  name: 'Design Triage',
  instructions: DESIGN_TRIAGE_AGENT_INSTRUCTIONS,
  model: 'gpt-4o',
  modelSettings: { temperature: 0 },
});

export async function runDesignAgent(prompt: string | AgentInputItem[]) {
  return run(designAgent, prompt, { stream: true });
}
