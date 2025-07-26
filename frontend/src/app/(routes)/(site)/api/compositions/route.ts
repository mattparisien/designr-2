import { NextRequest, NextResponse } from 'next/server';
import { makeBackendRequest, validateRequired } from './_utils';

// GET /api/compositions - Get all compositions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query parameters for filtering
    const queryParams = new URLSearchParams();

    // Add all search parameters to the query
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    const endpoint = `/compositions?${queryParams.toString()}`;
    const data = await makeBackendRequest(endpoint);

    return NextResponse.json({
      compositions: data.data || [],
      totalCompositions: data.pagination?.total || 0
    });
  } catch (error) {
    console.error('Error fetching compositions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compositions' }, 
      { status: 500 }
    );
  }
}

// POST /api/compositions - Create a new composition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'title', 'compositionData'];
    const missingField = validateRequired(body, requiredFields);
    if (missingField) {
      return NextResponse.json(
        { error: missingField }, 
        { status: 400 }
      );
    }

    // Set default values if not provided
    if (body.isTemplate === undefined) {
      body.isTemplate = false;
    }
    if (body.role === undefined) {
      body.role = body.isTemplate ? 'template' : 'project';
    }

    const data = await makeBackendRequest('/compositions', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating composition:', error);
    return NextResponse.json(
      { error: 'Failed to create composition' }, 
      { status: 500 }
    );
  }
}
