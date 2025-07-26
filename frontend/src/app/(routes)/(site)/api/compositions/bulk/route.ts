import { NextRequest, NextResponse } from 'next/server';

// Helper for backend requests
async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
  const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';
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

// POST /api/compositions/bulk - Perform bulk operations on compositions
export async function POST(request: NextRequest) {
  try {
    const { operation, ids, updates } = await request.json();
    
    if (!operation || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Operation and IDs array are required.' }, 
        { status: 400 }
      );
    }

    // Handle different bulk operations
    switch (operation) {
      case 'delete':
        await makeBackendRequest('/compositions/bulk', {
          method: 'POST',
          body: JSON.stringify({
            operation: 'delete',
            ids
          })
        });
        break;
        
      case 'update':
        if (!updates || typeof updates !== 'object') {
          return NextResponse.json(
            { error: 'Updates object is required for bulk update operation' }, 
            { status: 400 }
          );
        }
        
        await makeBackendRequest('/compositions/bulk', {
          method: 'POST',
          body: JSON.stringify({
            operation: 'update',
            ids,
            updates
          })
        });
        break;
        
      default:
        return NextResponse.json(
          { error: `Unsupported bulk operation: ${operation}` }, 
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing bulk operation on compositions:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' }, 
      { status: 500 }
    );
  }
}
