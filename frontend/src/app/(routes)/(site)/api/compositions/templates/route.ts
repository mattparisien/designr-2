import { NextRequest, NextResponse } from 'next/server';
import { makeBackendRequest, CompositionData } from '../_utils';

// GET /api/compositions/templates - Get all template compositions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const featured = searchParams.get('featured') === 'true';

    // Build query parameters with isTemplate=true to filter only templates
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      isTemplate: 'true' // This is the key filter for templates
    });

    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (featured) queryParams.append('featured', 'true');

    const endpoint = `/compositions?${queryParams.toString()}`;
    const data = await makeBackendRequest(endpoint);

    // Filter locally if needed
    let templates = data.data || [];
    
    // Ensure all returned items are templates
    templates = templates.filter((composition: CompositionData) => 
      composition.isTemplate === true
    );

    // Apply pagination to filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTemplates = templates.slice(startIndex, endIndex);
    
    const response = {
      templates: paginatedTemplates,
      totalTemplates: templates.length,
      page,
      limit,
      totalPages: Math.ceil(templates.length / limit),
      hasNextPage: endIndex < templates.length,
      hasPrevPage: page > 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch templates',
        templates: [],
        totalTemplates: 0,
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
