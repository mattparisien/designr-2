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

// GET /api/templates/featured - Get featured templates
export async function GET() {
  try {
    const data = await makeBackendRequest('/templates/featured/all');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching featured templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured templates' },
      { status: 500 }
    );
  }
}
