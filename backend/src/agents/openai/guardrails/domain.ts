import type { InputGuardrailFunctionArgs } from '@openai/agents';
import type { GuardrailFunctionOutput } from '@openai/agents-core';
import { run } from '@openai/agents';
import { designTriageAgent } from '../triageAgent';

export const domainGuardrail = {
  name: 'Design‑domain guardrail',
  async execute({ input, context }: InputGuardrailFunctionArgs): Promise<GuardrailFunctionOutput> {
    // Use triage agent to classify the intent
    const result = await run(designTriageAgent, input, { context: context });
    const isDesign = /design|logo|branding|layout|color|UI/i.test((result as any).finalOutput?.toString() ?? '');
    
    return {
      outputInfo: { 
        isDesign,
        // Store the generic message in outputInfo so it can be accessed later
        genericMessage: !isDesign ? "I apologize, but I can only assist with design-related tasks such as branding, layouts, color schemes, typography, and visual design elements. Please feel free to ask me about any design projects you're working on!" : null
      },
      tripwireTriggered: !isDesign,
    };
  }
};
