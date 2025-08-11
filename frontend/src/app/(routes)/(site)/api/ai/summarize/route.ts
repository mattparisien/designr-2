import { NextRequest, NextResponse } from 'next/server';

// Prefer BACKEND_API_URL (should include /api), fallback to NEXT_PUBLIC_API_URL or localhost default
const BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface SummarizeRequestBody {
  text: string;
  model?: string; // optional override
}

export async function POST(request: NextRequest) {
  try {
    const body: SummarizeRequestBody = await request.json();
    const { text, model, systemPrompt, temperature, maxTokens } = body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    // Forward Authorization header if present
    const authorization = request.headers.get('authorization') || undefined;

    const resp = await fetch(`${BASE_URL}/ai/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify({ text, ...(model ? { model } : {}), systemPrompt, temperature, maxTokens }),
    });

    // Try to return JSON; if backend didn't return JSON, forward text
    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await resp.json();
      return NextResponse.json(data, { status: resp.status });
    } else {
      const textOut = await resp.text();
      return new NextResponse(textOut, {
        status: resp.status,
        headers: { 'Content-Type': contentType || 'text/plain' },
      });
    }
  } catch (err) {
    console.error('[POST /api/ai/summarize] Error:', err);
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
  }
}
