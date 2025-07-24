import { NextResponse } from 'next/server';

interface ProjectData {
  _id: string;
  featured?: boolean;
  [key: string]: unknown;
}

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${BACKEND_API_URL}${endpoint}`;
  
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

// GET /api/projects/featured - Get featured projects
export async function GET() {
  try {
    // Since backend doesn't have /featured endpoint, we'll get all projects and filter for featured ones
    const data = await makeBackendRequest('/api/projects?limit=100');
    
    // Filter for featured projects (assuming projects have a featured property)
    const featuredProjects = data.projects?.filter((project: ProjectData) => project.featured) || [];
    
    return NextResponse.json({
      projects: featuredProjects,
      totalProjects: featuredProjects.length
    });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured projects' },
      { status: 500 }
    );
  }
}
