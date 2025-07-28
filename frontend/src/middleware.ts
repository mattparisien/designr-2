import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    console.log('Middleware called for:', request.nextUrl.pathname);

    // If the user is accessing the root path, redirect to /projects
    if (request.nextUrl.pathname === '/') {
        console.log('Redirecting to /projects');
        return NextResponse.redirect(new URL('/projects', request.url));
    }

    // Continue with the request for all other paths
    return NextResponse.next();
}

export const config = {
    // Simplified matcher - just match the root path and common routes
  matcher: ['/((?!api|_next|.*\\..*).*)']

};
