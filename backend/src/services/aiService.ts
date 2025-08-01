import OpenAI from 'openai';

// ────────────────────────────────────────────────────────────────
// AI Service for Design Tool - DESIGN PURPOSES ONLY
// ────────────────────────────────────────────────────────────────
// This service provides AI assistance exclusively for design-related
// tasks including graphic design, branding, visual content creation,
// and design tool usage. All non-design requests are rejected.
// ────────────────────────────────────────────────────────────────

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

export interface StreamChunk {
  content: string;
  done: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Design-focused system prompt for all AI interactions
 */
const DESIGN_SYSTEM_PROMPT = `You are a specialized AI assistant for design and creative projects ONLY.

IMPORTANT RESTRICTIONS:
- You can ONLY help with design, visual arts, creativity, branding, marketing content, and design tool usage
- You cannot provide assistance with: programming, coding, technical support, general knowledge, personal advice, medical/legal/financial advice, or any non-design topics
- If asked about non-design topics, politely redirect the user back to design-related questions

Your expertise includes:
- Graphic design principles and best practices
- Color theory, typography, and layout
- Brand identity and visual branding
- Marketing copy and content creation
- Creative direction and visual storytelling
- Design tool tips and workflows
- Social media content design
- Print and digital design formats

Always respond in a helpful, creative, and design-focused manner.`;

/**
 * Ensures messages include design-focused system prompt
 */
function ensureDesignFocus(messages: ChatMessage[]): ChatMessage[] {
  // Check if there's already a system message
  const hasSystemMessage = messages.some(msg => msg.role === 'system');
  
  if (!hasSystemMessage) {
    return [
      { role: 'system', content: DESIGN_SYSTEM_PROMPT },
      ...messages
    ];
  }
  
  // Replace existing system message with design-focused one
  return messages.map(msg => 
    msg.role === 'system' 
      ? { role: 'system', content: DESIGN_SYSTEM_PROMPT }
      : msg
  );
}

/**
 * Generate AI response using OpenAI's chat completion API with streaming - DESIGN PURPOSES ONLY
 */
export async function* generateAIResponseStream(
  messages: ChatMessage[],
  model: string = 'gpt-4o'
): AsyncGenerator<StreamChunk, void, unknown> {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI client not available. Please check your API key configuration.');
  }

  // Ensure design focus in all conversations
  const designFocusedMessages = ensureDesignFocus(messages);

  try {
    const stream = await client.chat.completions.create({
      model,
      messages: designFocusedMessages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    let fullContent = '';
    
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      
      if (delta?.content) {
        fullContent += delta.content;
        yield {
          content: delta.content,
          done: false,
        };
      }
      
      // Check if this is the final chunk
      if (chunk.choices[0]?.finish_reason) {
        yield {
          content: '',
          done: true,
          usage: chunk.usage ? {
            prompt_tokens: chunk.usage.prompt_tokens,
            completion_tokens: chunk.usage.completion_tokens,
            total_tokens: chunk.usage.total_tokens,
          } : undefined,
        };
      }
    }
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(`AI response generation failed: ${error.message}`);
  }
}

/**
 * Generate AI response using OpenAI's chat completion API - DESIGN PURPOSES ONLY
 */
export async function generateAIResponse(
  messages: ChatMessage[],
  model: string = 'gpt-4o'
): Promise<AIResponse> {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI client not available. Please check your API key configuration.');
  }

  // Ensure design focus in all conversations
  const designFocusedMessages = ensureDesignFocus(messages);

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: designFocusedMessages,
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
 * Generate AI response for a simple user prompt - DESIGN PURPOSES ONLY
 */
export async function generateSimpleResponse(
  userPrompt: string,
  model: string = 'gpt-4o'
): Promise<AIResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: DESIGN_SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: userPrompt
    }
  ];

  return generateAIResponse(messages, model);
}
