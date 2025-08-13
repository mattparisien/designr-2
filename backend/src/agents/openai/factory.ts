import { Agent, AgentInputItem, run } from '@openai/agents';
import { BRANDING_AGENT_INSTRUCTIONS, DESIGN_AGENT_INSTRUCTIONS, PROJECT_AGENT_INSTRUCTIONS } from './constants';
import { createBrandTool } from './tools/createBrand';
import { createProjectTool } from './tools/createProject';
import { getTemplateTool} from './tools/getTemplate';
import { paletteTool } from './tools/palette';

export const brandingAgent = new Agent({
  name: 'Branding Specialist',
  handoffDescription: 'Handles creation of brand identities',
  instructions: BRANDING_AGENT_INSTRUCTIONS,
  tools: [paletteTool, createBrandTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
});

export const projectAgent = new Agent({
  name: 'Project Specialist',
  handoffDescription: 'Handles creationg of design projects.',
  instructions: PROJECT_AGENT_INSTRUCTIONS,
  tools: [createProjectTool, getTemplateTool],
  model: 'gpt-4o-mini',
  modelSettings: { temperature: 0.6 },
});

export const designAgent = new Agent({
  name: 'Design Assistant',
  instructions: DESIGN_AGENT_INSTRUCTIONS,
  tools: [paletteTool],
  handoffDescription: 'Handles design tasks including layout, branding, and template suggestions. Always pass to the branding specialist for any brand related tasks. Always pass to the project specialist for any project related tasks such as any kind of design creation request (presentations, social posts, etc.).',
  handoffs: [brandingAgent, projectAgent],
  model: 'gpt-4o',
  modelSettings: { temperature: 0.6 },
  toolUseBehavior: 'run_llm_again',
});

export async function runDesignAgent(prompt: string | AgentInputItem[]) {
  return run(designAgent, prompt, { stream: true });
}
