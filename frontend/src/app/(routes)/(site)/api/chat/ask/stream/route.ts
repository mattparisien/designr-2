import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BACKEND_API_URL;

export interface StreamAskRequest {
    chatSessionId?: string;
    content: string;
    model?: string;
}

// POST /api/chat/ask/stream - Stream AI response
export async function POST(request: NextRequest) {
    try {
        const body: StreamAskRequest = await request.json();

        const response = await fetch(`${BASE_URL}/chat/ask/stream`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'Failed to stream AI response' }, 
                { status: response.status }
            );
        }

        // Return the streaming response
        return new NextResponse(response.body, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('[POST /api/chat/ask/stream] Error:', error);
        return NextResponse.json(
            { message: 'Failed to stream AI response' }, 
            { status: 500 }
        );
    }
}
