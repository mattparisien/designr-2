import { NextRequest, NextResponse } from 'next/server';
import { makeBackendRequest, CompositionData } from '../_utils';

// GET /api/compositions/paginated - Get paginated compositions
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
    const isTemplate = searchParams.has('isTemplate') ? searchParams.get('isTemplate') === 'true' : undefined;

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
    if (isTemplate !== undefined) queryParams.append('isTemplate', isTemplate.toString());

    const endpoint = `/compositions?${queryParams.toString()}`;
    const data = await makeBackendRequest(endpoint);

    // Filter locally if needed (in case backend doesn't support all filters)
    let filteredCompositions = data.data || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredCompositions = filteredCompositions.filter((composition: CompositionData) =>
        composition.title?.toLowerCase().includes(searchLower) ||
        composition.name?.toLowerCase().includes(searchLower) ||
        composition.description?.toLowerCase().includes(searchLower) ||
        composition.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination to filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCompositions = filteredCompositions.slice(startIndex, endIndex);
    
    const response = {
      compositions: paginatedCompositions,
      totalCompositions: filteredCompositions.length,
      page,
      limit,
      currentPage: page,
      totalPages: Math.ceil(filteredCompositions.length / limit),
      hasNextPage: endIndex < filteredCompositions.length,
      hasPrevPage: page > 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching paginated compositions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch compositions',
        compositions: [],
        totalCompositions: 0,
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
