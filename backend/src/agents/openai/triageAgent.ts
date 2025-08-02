// src/agents/triageAgent.ts
import { Agent } from '@openai/agents';

export const designTriageAgent = new Agent({
    name: 'Design Triage',
    instructions: `
You are a classifier agent. Given a user's message, respond with "yes" if the message is about design, branding, graphic arts, UI, or visual creativity.
If not, respond "no".
Respond with only "yes" or "no".`,
    model: 'gpt-4o',
    modelSettings: { temperature: 0 },
});