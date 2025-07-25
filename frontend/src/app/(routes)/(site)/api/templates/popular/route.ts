import { NextResponse } from 'next/server';

interface TemplateData {
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

// GET /api/templates/popular - Get popular templates
export async function GET() {
  try {
    // Since backend doesn't have /popular endpoint, we'll get all templates and filter for popular ones
    const data = await makeBackendRequest('/templates?limit=100');
    
    // Filter for popular templates (assuming templates have a popular property)
    const allTemplates = data.templates || [];
    const popularTemplates = allTemplates.filter((template: TemplateData) => template.popular === true);
    
    return NextResponse.json({ templates: popularTemplates });
  } catch (error) {
    console.error('Error fetching popular templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular templates' },
      { status: 500 }
    );
  }
}
