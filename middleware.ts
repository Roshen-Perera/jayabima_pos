import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

// Define public routes (don't require authentication)
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Define auth routes (redirect to dashboard if already logged in)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    // Verify token
    const user = token ? verifyToken(token) : null;

    // Check if the route is public
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Check if the route is an auth route
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // If user is logged in and trying to access auth routes, redirect to dashboard
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is not logged in and trying to access protected routes, redirect to login
    if (!user && !isPublicRoute && pathname !== '/') {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is logged in, add user info to headers (optional, for server components)
    if (user) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.userId);
        requestHeaders.set('x-user-role', user.role);
        requestHeaders.set('x-user-email', user.email);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
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