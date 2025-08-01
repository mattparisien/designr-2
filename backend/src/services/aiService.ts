import OpenAI from 'openai';

// ────────────────────────────────────────────────────────────────
// OpenAI client setup
// ────────────────────────────────────────────────────────────────
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.warn('OpenAI API key not found in environment variables');
    return null;
  }
  openai = new OpenAI({ apiKey: key });
  return openai;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate AI response using OpenAI's chat completion API
 */
export async function generateAIResponse(
  messages: ChatMessage[],
  model: string = 'gpt-4o'
): Promise<AIResponse> {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI client not available. Please check your API key configuration.');
  }

  try {
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiMessage = completion.choices[0]?.message;
    if (!aiMessage?.content) {
      throw new Error('No response content received from OpenAI');
    }

    return {
      content: aiMessage.content,
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      } : undefined,
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(`AI response generation failed: ${error.message}`);
  }
}

/**
 * Generate AI response for a simple user prompt
 */
export async function generateSimpleResponse(
  userPrompt: string,
  model: string = 'gpt-4o'
): Promise<AIResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions.'
    },
    {
      role: 'user',
      content: userPrompt
    }
  ];

  return generateAIResponse(messages, model);
}
