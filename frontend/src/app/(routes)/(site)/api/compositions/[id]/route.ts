import { NextRequest, NextResponse } from 'next/server';
import { makeBackendRequest } from '../../_utils';

// GET /api/compositions/[id] - Get a specific composition
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await makeBackendRequest(`/compositions/${id}`);

    if (!data) {
      return NextResponse.json(
        { error: 'Composition not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching composition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch composition' }, 
      { status: 500 }
    );
  }
}

// PUT /api/compositions/[id] - Update a composition
export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const data = await makeBackendRequest(`/compositions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating composition:', error);
    return NextResponse.json(
      { error: 'Failed to update composition' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/compositions/[id] - Delete a composition
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await makeBackendRequest(`/compositions/${id}`, {
      method: 'DELETE'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting composition:', error);
    return NextResponse.json(
      { error: 'Failed to delete composition' }, 
      { status: 500 }
    );
  }
}
