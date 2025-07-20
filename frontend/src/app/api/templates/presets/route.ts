import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${BACKEND_API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    throw error;
  }
}

// GET /api/templates/presets - Get template presets
export async function GET() {
  try {
    const data = await makeBackendRequest('/templates/presets/all');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching template presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template presets' },
      { status: 500 }
    );
  }
}
