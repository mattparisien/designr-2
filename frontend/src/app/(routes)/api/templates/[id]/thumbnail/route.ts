import { NextRequest, NextResponse } from 'next/server';

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

// POST /api/templates/[id]/thumbnail - Upload template thumbnail
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const data = await makeBackendRequest(`/templates/${id}/thumbnail`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error uploading thumbnail for template ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to upload template thumbnail' },
      { status: 500 }
    );
  }
}
