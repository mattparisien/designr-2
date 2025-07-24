import { NextResponse } from 'next/server';

interface ProjectData {
  _id: string;
  popular?: boolean;
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

// GET /api/projects/popular - Get popular projects
export async function GET() {
  try {
    // Since backend doesn't have /popular endpoint, we'll get all projects and filter for popular ones
    const data = await makeBackendRequest('/api/projects?limit=100');
    
    // Filter for popular projects (assuming projects have a popular property)
    const popularProjects = data.projects?.filter((project: ProjectData) => project.popular) || [];
    
    return NextResponse.json({
      projects: popularProjects,
      totalProjects: popularProjects.length
    });
  } catch (error) {
    console.error('Error fetching popular projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular projects' },
      { status: 500 }
    );
  }
}
