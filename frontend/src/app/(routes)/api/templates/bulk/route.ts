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

// DELETE /api/templates/bulk - Delete multiple templates
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required and must not be empty' },
        { status: 400 }
      );
    }
    
    await makeBackendRequest('/templates/bulk', {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting multiple templates:', error);
    return NextResponse.json(
      { error: 'Failed to delete multiple templates' },
      { status: 500 }
    );
  }
}
