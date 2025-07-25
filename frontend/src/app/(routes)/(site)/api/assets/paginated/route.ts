import { NextRequest, NextResponse } from 'next/server';
import { makeBackendRequest } from '../../_utils';

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

    const endpoint = `/assets?${queryParams.toString()}`;
    const data = await makeBackendRequest(endpoint);

    // Filter locally if needed (in case backend doesn't support all filters)
    const filteredAssets = data.assets || [];

    // Apply pagination to filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedAssets = filteredAssets.slice(startIndex, endIndex).map(x => ({
      ...x,
      thumbnailUrl: x.thumbnail || x.cloudinaryUrl || x.url,
    }));

    const response = {
      assets: paginatedAssets,
      totalAssets: filteredAssets.length,
      page,
      limit,
      currentPage: page,
      totalPages: Math.ceil(filteredAssets.length / limit),
      hasNextPage: endIndex < filteredAssets.length,
      hasPrevPage: page > 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching paginated assets:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch assets',
        assets: [],
        totalAssets: 0,
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
