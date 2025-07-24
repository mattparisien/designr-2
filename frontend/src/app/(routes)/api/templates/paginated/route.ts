import { NextRequest, NextResponse } from 'next/server';

// Template type for filtering
interface TemplateData {
  _id: string;
  title?: string;
  description?: string;
  tags?: string[];
  [key: string]: unknown;
}

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001/api';

async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
    console.log(endpoint, options);
  const url = `${BACKEND_API_URL}${endpoint}`;
  
  console.log(url);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    throw error;
  }
}

// GET /api/templates/paginated - Get paginated templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('herreeeeeee!')
    // Extract pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get other filter parameters
    const vibe = searchParams.get('vibe');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Build query params for backend (using a higher limit to get total count)
    const backendParams = new URLSearchParams();
    if (vibe) backendParams.append('vibe', vibe);
    if (category) backendParams.append('category', category);
    
    // Get a larger dataset from backend to implement pagination on frontend
    // This is a temporary solution until backend implements proper pagination
    backendParams.append('limit', '1000'); // Get more data to paginate frontend-side
    
    const queryString = backendParams.toString();
    const endpoint = `/templates${queryString ? `?${queryString}` : ''}`;
    
    const backendResponse = await makeBackendRequest(endpoint);
    const allTemplates = backendResponse.templates || [];
    
    // Apply search filter if provided (frontend-side filtering)
    let filteredTemplates = allTemplates;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = allTemplates.filter((template: TemplateData) => 
        template.title?.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Calculate pagination
    const totalTemplates = filteredTemplates.length;
    const totalPages = Math.ceil(totalTemplates / limit);
    const paginatedTemplates = filteredTemplates.slice(skip, skip + limit);
    
    const response = {
      templates: paginatedTemplates,
      totalTemplates,
      totalPages,
      currentPage: page,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching paginated templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paginated templates' },
      { status: 500 }
    );
  }
}
