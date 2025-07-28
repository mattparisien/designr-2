import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authorization = request.headers.get('authorization');
    
    // Get the form data from the request
    const formData = await request.formData();
    
    // Log the upload attempt
    console.log('Frontend API: Proxying assets upload to backend...');
    console.log('Backend URL:', `${BACKEND_URL}/assets/upload`);
    console.log('Authorization header present:', !!authorization);
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/assets/upload`, {
      method: 'POST',
      headers: {
        ...(authorization && { Authorization: authorization }),
        // Don't set Content-Type for FormData, let the browser set it with boundary
      },
      body: formData, // Send formData directly for file uploads
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend upload error:', errorText);
      return NextResponse.json(
        { error: `Upload failed: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Upload successful:', data.success);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying assets upload request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
