import { NextRequest, NextResponse } from 'next/server';

// Prefer BACKEND_API_URL (should include /api), fallback to NEXT_PUBLIC_API_URL or localhost default
const BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(`${BASE_URL}/templates/paginated`);

    // Forward all query params (page, limit, category, isPublic, etc.)
    req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/templates/paginated] Proxy error:', message);
    return NextResponse.json({ message: 'Failed to fetch paginated templates' }, { status: 500 });
  }
}