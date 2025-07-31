import { type CreateChatSessionPayload } from '@/lib/types/api';
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BACKEND_API_URL;

export interface CreateSessionRequest {
    title?: string;
    initialMessage?: string;
}

// GET /api/chat/sessions - Get all chat sessions for the user
export async function GET() {
    try {
        const res = await fetch(`${BASE_URL}/chat/sessions`);
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[GET /api/chat/sessions] Error:', error);
        return NextResponse.json({ message: 'Failed to fetch chat sessions' }, { status: 500 });
    }
}

// POST /api/chat/sessions - Create a new chat session
export async function POST(request: NextRequest) {
    try {
        const body: CreateChatSessionPayload = await request.json();

        const res = await fetch(`${BASE_URL}/chat/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[POST /api/chat/sessions] Error:', error);
        return NextResponse.json({ message: 'Failed to create chat session' }, { status: 500 });
    }
}

// DELETE /api/chat/sessions - Delete all sessions (bulk delete)
export async function DELETE() {
    try {
        const res = await fetch(`${BASE_URL}/chat/sessions`, {
            method: 'DELETE',
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('[DELETE /api/chat/sessions] Error:', error);
        return NextResponse.json({ message: 'Failed to delete chat sessions' }, { status: 500 });
    }
}
