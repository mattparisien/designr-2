import { Agent, run, StreamedRunResult, AgentInputItem } from '@openai/agents';
import type { StreamRunOptions } from '@openai/agents';
import { domainGuardrail } from './guardrails/domain';
import { paletteTool } from './tools/palette';
import { brandingAgent, layoutAgent } from './designAgent';
import { SYSTEM_PROMPT } from './constants';

export const systemInstructions = SYSTEM_PROMPT;

export const designAgent = new Agent({
  name: 'Design Assistant',
  instructions: systemInstructions,
  tools: [paletteTool],
  // inputGuardrails: [domainGuardrail],
  handoffs: [brandingAgent, layoutAgent],  // sub-agents for specialization
  modelSettings: { temperature: 0.6 },
  toolUseBehavior: 'run_llm_again',
});

export async function runDesignAgent(prompt: string | AgentInputItem[]) {
  return run(designAgent, prompt, { stream: true });
}
