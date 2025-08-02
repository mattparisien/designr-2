import { AgentInputItem } from '@openai/agents';

// Create conversation history from message pairs for the agent
export const buildConversationHistory = (messages: Array<{ role: 'user' | 'assistant', content: string }>): AgentInputItem[] => {
    return messages.map(msg => {
        if (msg.role === 'user') {
            return {
                role: 'user',
                content: [{ type: 'input_text', text: msg.content }]
            } as AgentInputItem;
        } else {
            return {
                role: 'assistant',
                content: [{ type: 'output_text', text: msg.content }],
                status: 'completed'
            } as AgentInputItem;
        }
    });
};
