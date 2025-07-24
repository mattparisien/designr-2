import { NextRequest, NextResponse } from 'next/server';

// This would typically come from your backend API client
// For now, I'm using a placeholder - you'll need to replace this with your actual backend client
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

// GET /api/projects - Get all projects with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query string for backend
    const queryString = searchParams.toString();
    const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;
    
    const data = await makeBackendRequest(endpoint);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const data = await makeBackendRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
