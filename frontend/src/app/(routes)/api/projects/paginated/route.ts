import { NextRequest, NextResponse } from 'next/server';
import { makeBackendRequest, ProjectData } from '../_utils';

// GET /api/projects/paginated - Get paginated projects
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
    const type = searchParams.get('type') || '';

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (starred) queryParams.append('starred', 'true');
    if (shared) queryParams.append('shared', 'true');
    if (type) queryParams.append('type', type);

    const endpoint = `/projects?${queryParams.toString()}`;
    const data = await makeBackendRequest(endpoint);
    console.log(data, 'data from backend')

    // Filter locally if needed (in case backend doesn't support all filters)
    let filteredProjects = data.projects || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter((project: ProjectData) =>
        project.title?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination to filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    const response = {
      projects: paginatedProjects,
      totalProjects: filteredProjects.length,
      page,
      limit,
      currentPage: page,
      totalPages: Math.ceil(filteredProjects.length / limit),
      hasNextPage: endIndex < filteredProjects.length,
      hasPrevPage: page > 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching paginated projects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects',
        projects: [],
        totalProjects: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      { status: 500 }
    );
  }
}
