import { Agent, AgentInputItem, run } from '@openai/agents';
import { DESIGN_AGENT_INSTRUCTIONS, DESIGN_TRIAGE_AGENT_INSTRUCTIONS, LAYOUT_AGENT_INSTRUCTIONS } from './constants';
import { paletteTool } from './tools/palette';
import { templateSuggestTool } from './tools/templateSuggest';

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
  instructions: DESIGN_AGENT_INSTRUCTIONS,
  tools: [paletteTool, templateSuggestTool],
  // inputGuardrails: [domainGuardrail],
  handoffs: [layoutAgent],  // sub-agents for specialization
  modelSettings: { temperature: 0.6 },
  toolUseBehavior: 'run_llm_again',
});

// export const brandingAgent = new Agent({
//   name: 'Branding Specialist',
//   handoffDescription: 'Handles branding-related design tasks like logo, color, tone of voice',
//   instructions: BRANDING_AGENT_INSTRUCTIONS,
//   tools: [paletteTool],
//   model: 'gpt-4o-mini',
//   modelSettings: { temperature: 0.6 },
//   // inputGuardrails: [domainGuardrail],
// });

export const designTriageAgent = new Agent({
  name: 'Design Triage',
  instructions: DESIGN_TRIAGE_AGENT_INSTRUCTIONS,
  model: 'gpt-4o',
  modelSettings: { temperature: 0 },
});

export async function runDesignAgent(prompt: string | AgentInputItem[]) {
  return run(designAgent, prompt, { stream: true });
}
