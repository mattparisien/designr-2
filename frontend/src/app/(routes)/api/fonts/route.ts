import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (userId) {
      queryParams.set('userId', userId);
    }
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/fonts?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend responded with ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying fonts request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authorization = request.headers.get('authorization');
    
    // Get the font ID from the URL - for DELETE operations, we might need to handle dynamic routes
    const url = new URL(request.url);
    const fontId = url.searchParams.get('id');
    
    if (!fontId) {
      return NextResponse.json(
        { error: 'Font ID is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/fonts/${fontId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { Authorization: authorization }),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend responded with ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying fonts delete request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
