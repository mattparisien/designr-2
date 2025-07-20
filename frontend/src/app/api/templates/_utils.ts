/**
 * Shared utility for making requests to the backend API
 * Used by all template API routes
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
