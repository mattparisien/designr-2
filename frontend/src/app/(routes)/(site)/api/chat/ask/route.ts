import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BACKEND_API_URL;

export interface AskRequest {
    chatSessionId?: string;
    content: string;
    model?: string;
}

// POST /api/chat/ask - Send a message to AI and get response
export async function POST(request: NextRequest) {
    try {
        const body: AskRequest = await request.json();

        if (!body.content) {
            return NextResponse.json({ message: 'Content is required' }, { status: 400 });
        }

        const res = await fetch(`${BASE_URL}/chat/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[POST /api/chat/ask] Error:', error);
        return NextResponse.json({ message: 'Failed to get AI response' }, { status: 500 });
    }
}
