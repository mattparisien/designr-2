import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authorization = request.headers.get('authorization');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const folderId = searchParams.get('folderId');
    
    // Build query string for backend
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (folderId) params.append('folderId', folderId);
    
    const queryString = params.toString();
    const backendUrl = `${BACKEND_URL}/assets${queryString ? `?${queryString}` : ''}`;
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'GET',
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
    console.error('Error proxying assets request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authorization = request.headers.get('authorization');
    
    // For file uploads, we need to handle FormData
    const contentType = request.headers.get('content-type');
    let body;
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      body = await request.formData();
    } else {
      // Handle JSON data
      body = JSON.stringify(await request.json());
    }
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/assets`, {
      method: 'POST',
      headers: {
        ...(authorization && { Authorization: authorization }),
        // Don't set Content-Type for FormData, let the browser set it
        ...(!(contentType?.includes('multipart/form-data')) && { 'Content-Type': 'application/json' }),
      },
      body,
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
    console.error('Error proxying assets upload request:', error);
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
    
    // Get the asset ID from the URL
    const url = new URL(request.url);
    const assetId = url.searchParams.get('id');
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/assets/${assetId}`, {
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
    console.error('Error proxying assets delete request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
