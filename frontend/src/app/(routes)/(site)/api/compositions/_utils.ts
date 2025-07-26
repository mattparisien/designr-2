/**
 * Shared utility for making requests to the backend API
 * Used by all composition API routes
 */

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

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
      // If compositions endpoint doesn't exist, fall back to empty data structure
      if (response.status === 404 && endpoint.includes('/compositions')) {
        console.warn(`Compositions endpoint not found: ${endpoint}. Returning empty result.`);
        return {
          compositions: [],
          totalCompositions: 0
        };
      }
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    // Handle DELETE requests which may not return JSON
    if (options.method === 'DELETE') {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    
    // If the error is a 404 for compositions, return empty structure
    if (error instanceof Error && error.message.includes('404') && endpoint.includes('/compositions')) {
      console.warn(`Compositions endpoint not found: ${endpoint}. Returning empty result.`);
      return {
        compositions: [],
        totalCompositions: 0
      };
    }
    
    throw error;
  }
}

/**
 * Common composition data interface
 */
export interface CompositionData {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  tags?: string[];
  category?: string;
  type?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  compositionData?: Record<string, unknown>;
  isTemplate: boolean;
  role: 'project' | 'template';
  starred?: boolean;
  shared?: boolean;
  featured?: boolean;
  popular?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Standard pagination response format
 */
export interface PaginatedResponse<T> {
  compositions: T[];
  totalCompositions: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Filter compositions based on search criteria
 */
export function filterCompositions(compositions: CompositionData[], filters: {
  search?: string;
  category?: string;
  starred?: boolean;
  shared?: boolean;
  type?: string;
  isTemplate?: boolean;
}): CompositionData[] {
  let filtered = [...compositions];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(composition =>
      composition.title?.toLowerCase().includes(searchLower) ||
      composition.name?.toLowerCase().includes(searchLower) ||
      composition.description?.toLowerCase().includes(searchLower) ||
      composition.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  if (filters.category) {
    filtered = filtered.filter(composition => composition.category === filters.category);
  }

  if (filters.starred !== undefined) {
    filtered = filtered.filter(composition => composition.starred === filters.starred);
  }

  if (filters.shared !== undefined) {
    filtered = filtered.filter(composition => composition.shared === filters.shared);
  }

  if (filters.type) {
    filtered = filtered.filter(composition => composition.type === filters.type);
  }

  if (filters.isTemplate !== undefined) {
    filtered = filtered.filter(composition => composition.isTemplate === filters.isTemplate);
  }

  return filtered;
}

/**
 * Helper to validate required fields in request body
 */
export function validateRequired(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (!body[field]) {
      return `${field} is required`;
    }
  }
  return null;
}

/**
 * Helper to validate pagination parameters
 */
export function validatePagination(page: number, limit: number): string | null {
  if (page < 1) {
    return 'Page must be greater than 0';
  }
  if (limit < 1 || limit > 100) {
    return 'Limit must be between 1 and 100';
  }
  return null;
}
