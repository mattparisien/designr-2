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

    // Handle DELETE requests which may not return JSON
    if (options.method === 'DELETE') {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    throw error;
  }
}

// GET /api/projects/[id] - Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await makeBackendRequest(`/projects/${id}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching project ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const data = await makeBackendRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error updating project ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await makeBackendRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting project ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
