import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BACKEND_API_URL;

// GET /api/chat/sessions/[id] - Get a specific chat session with messages
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const res = await fetch(`${BASE_URL}/chat/sessions/${id}`);
        
        if (!res.ok) {
            return NextResponse.json(
                { message: 'Session not found' }, 
                { status: res.status }
            );
        }
        
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error(`[GET /api/chat/sessions/${params?.id}] Error:`, error);
        return NextResponse.json(
            { message: 'Failed to fetch chat session' }, 
            { status: 500 }
        );
    }
}

// PUT /api/chat/sessions/[id] - Update a specific chat session
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        
        const res = await fetch(`${BASE_URL}/chat/sessions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        
        if (!res.ok) {
            return NextResponse.json(
                { message: 'Failed to update session' }, 
                { status: res.status }
            );
        }
        
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error(`[PUT /api/chat/sessions/${params?.id}] Error:`, error);
        return NextResponse.json(
            { message: 'Failed to update chat session' }, 
            { status: 500 }
        );
    }
}

// DELETE /api/chat/sessions/[id] - Delete a specific chat session
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const res = await fetch(`${BASE_URL}/chat/sessions/${id}`, {
            method: 'DELETE',
        });
        
        if (!res.ok) {
            return NextResponse.json(
                { message: 'Failed to delete session' }, 
                { status: res.status }
            );
        }
        
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error(`[DELETE /api/chat/sessions/${params?.id}] Error:`, error);
        return NextResponse.json(
            { message: 'Failed to delete chat session' }, 
            { status: 500 }
        );
    }
}
