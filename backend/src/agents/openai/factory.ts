import { Agent, AgentInputItem, run } from '@openai/agents';
import { DESIGN_AGENT_INSTRUCTIONS, DESIGN_TRIAGE_AGENT_INSTRUCTIONS, LAYOUT_AGENT_INSTRUCTIONS, BRANDING_AGENT_INSTRUCTIONS } from './constants';
import { paletteTool } from './tools/palette';
import { templateSuggestTool } from './tools/templateSuggest';
import { createBrandTool } from './tools/createBrand';

export const brandingAgent = new Agent({
  name: 'Branding Specialist',
  handoffDescription: 'Handles creation of brand identities',
  instructions: BRANDING_AGENT_INSTRUCTIONS,
  tools: [paletteTool, createBrandTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
});

export const designAgent = new Agent({
  name: 'Design Assistant',
  instructions: DESIGN_AGENT_INSTRUCTIONS,
  tools: [paletteTool, templateSuggestTool],
  handoffDescription: 'Handles design tasks including layout, branding, and template suggestions. Always pass to the branding specialist for any brand related tasks.',
  handoffs: [brandingAgent],
  model: 'gpt-4o',
  modelSettings: { temperature: 0.6 },
  toolUseBehavior: 'run_llm_again',
});

export async function runDesignAgent(prompt: string | AgentInputItem[]) {
  return run(designAgent, prompt, { stream: true });
}
