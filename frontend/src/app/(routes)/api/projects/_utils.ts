/**
 * Shared utility for making requests to the backend API
 * Used by all project API routes
 */

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
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

    // Handle DELETE requests which may not return JSON
    if (options.method === 'DELETE') {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    throw error;
  }
}

/**
 * Common project data interface
 */
export interface ProjectData {
  _id: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  starred?: boolean;
  shared?: boolean;
  featured?: boolean;
  popular?: boolean;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Standard pagination response format
 */
export interface PaginatedResponse<T> {
  projects: T[];
  totalProjects: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Filter projects based on search criteria
 */
export function filterProjects(projects: ProjectData[], filters: {
  search?: string;
  category?: string;
  starred?: boolean;
  shared?: boolean;
  type?: string;
}): ProjectData[] {
  let filtered = [...projects];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(project =>
      project.title?.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower) ||
      project.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  if (filters.category) {
    filtered = filtered.filter(project => project.category === filters.category);
  }

  if (filters.starred !== undefined) {
    filtered = filtered.filter(project => project.starred === filters.starred);
  }

  if (filters.shared !== undefined) {
    filtered = filtered.filter(project => project.shared === filters.shared);
  }

  if (filters.type) {
    filtered = filtered.filter(project => project.type === filters.type);
  }

  return filtered;
}
