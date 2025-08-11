import { tool } from '@openai/agents';

const BASE_API = (process.env.BACKEND_API_URL?.replace(/\/$/, '') || 'http://localhost:5001/api');

export const createBrandTool = tool({
  name: 'create_brand',
  description: 'Creates a new brand with the provided details. Must ALWAYS be called when the user asks for a new brand.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'primaryColor', 'secondaryColor', 'accentColor', 'vibe', 'voice', 'personality', 'targetAudience', 'toneGuidelines', 'keyValues', 'communicationStyle', 'industry', 'tagline', 'doNotUse', 'preferredWords', 'avoidedWords'],
    properties: {
      name: { type: 'string', minLength: 1 },
      primaryColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
      secondaryColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
      accentColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
      vibe: { type: 'string', enum: ['playful','elegant','bold','minimal','professional'] },
      voice: { type: 'string' },
      personality: { type: 'string' },
      targetAudience: { type: 'string' },
      toneGuidelines: { type: 'string' },
      keyValues: { type: 'string' },
      communicationStyle: { type: 'string' },
      industry: { type: 'string' },
      tagline: { type: 'string' },
      doNotUse: { type: 'string' },
      preferredWords: { type: 'array', items: { type: 'string' } },
      avoidedWords: { type: 'array', items: { type: 'string' } },
    },
  } as const,
  async execute(input: any) {
    const {
      name,
      primaryColor,
      secondaryColor,
      accentColor,
      vibe,
      voice,
      personality,
      targetAudience,
      toneGuidelines,
      keyValues,
      communicationStyle,
      industry,
      tagline,
      doNotUse,
      preferredWords,
      avoidedWords,
    } = input || {};

    // Compose palettes array from input
    const palettes = [{ primary: primaryColor, secondary: secondaryColor, accent: accentColor }];

    const payload: Record<string, any> = {
      name,
      palettes,
      vibe,
    };

    // Append optional fields if provided
    if (voice) payload.voice = voice;
    if (personality) payload.personality = personality;
    if (targetAudience) payload.targetAudience = targetAudience;
    if (toneGuidelines) payload.toneGuidelines = toneGuidelines;
    if (keyValues) payload.keyValues = keyValues;
    if (communicationStyle) payload.communicationStyle = communicationStyle;
    if (industry) payload.industry = industry;
    if (tagline) payload.tagline = tagline;
    if (doNotUse) payload.doNotUse = doNotUse;
    if (Array.isArray(preferredWords)) payload.preferredWords = preferredWords;
    if (Array.isArray(avoidedWords)) payload.avoidedWords = avoidedWords;

    const url = `${BASE_API}/brands`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok) {
        return { success: false, status: res.status, error: data?.error || data || text || 'request_failed' };
      }

      return data ?? { success: true };
    } catch (err: any) {
      return { success: false, error: 'network_error', message: err?.message };
    }
  }
});
