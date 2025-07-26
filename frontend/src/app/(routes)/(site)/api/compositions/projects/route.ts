import { NextRequest, NextResponse } from 'next/server';
import { makeBackendRequest, CompositionData } from '../_utils';

// GET /api/compositions/projects - Get all project compositions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const starred = searchParams.get('starred') === 'true';
    const shared = searchParams.get('shared') === 'true';

    // Build query parameters with isTemplate=false to filter only projects
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      isTemplate: 'false' // This is the key filter for projects
    });

    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (starred) queryParams.append('starred', 'true');
    if (shared) queryParams.append('shared', 'true');

    const endpoint = `/compositions?${queryParams.toString()}`;
    const data = await makeBackendRequest(endpoint);

    // Filter locally if needed
    let projects = data.data || [];
    
    // Ensure all returned items are projects
    projects = projects.filter((composition: CompositionData) => 
      composition.isTemplate === false
    );

    // Apply pagination to filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = projects.slice(startIndex, endIndex);
    
    const response = {
      projects: paginatedProjects,
      totalProjects: projects.length,
      page,
      limit,
      totalPages: Math.ceil(projects.length / limit),
      hasNextPage: endIndex < projects.length,
      hasPrevPage: page > 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects',
        projects: [],
        totalProjects: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      { status: 500 }
    );
  }
}
