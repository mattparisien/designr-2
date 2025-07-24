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

// POST /api/templates/from-project/[projectId] - Create template from existing project
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    const body = await request.json();
    
    if (!body.slug) {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      );
    }
    
    const data = await makeBackendRequest(`/templates/from-project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(`Error creating template from project ${params.projectId}:`, error);
    return NextResponse.json(
      { error: 'Failed to create template from project' },
      { status: 500 }
    );
  }
}
