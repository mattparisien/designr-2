import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

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

// GET /api/templates/category/[category] - Get templates by category
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params;
    
    // Use the backend's category filtering
    const data = await makeBackendRequest(`/templates?category=${encodeURIComponent(category)}&limit=100`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching templates for category ${params.category}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch templates by category' },
      { status: 500 }
    );
  }
}
