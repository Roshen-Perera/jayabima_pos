import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes (don't require authentication)
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Define auth routes (redirect to dashboard if already logged in)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookie (just check existence, don't verify here)
    const token = request.cookies.get('auth-token')?.value;
    const hasToken = !!token;

    // Check if the route is public
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Check if the route is an auth route
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // ⭐ If user has token and trying to access auth routes, redirect to dashboard
    // Actual token verification happens in server components
    if (hasToken && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // ⭐ If user has no token and trying to access protected routes, redirect to login
    if (!hasToken && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};