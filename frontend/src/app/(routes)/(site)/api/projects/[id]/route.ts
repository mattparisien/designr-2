import { NextRequest, NextResponse } from 'next/server';
import { makeBackendRequest } from '../_utils';

// GET /api/projects/[id] - Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await makeBackendRequest(`/api/projects/${id}`);
    
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
    
    const data = await makeBackendRequest(`/api/projects/${id}`, {
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
    
    await makeBackendRequest(`/api/projects/${id}`, {
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
