import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Auth routes that require authentication
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
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
}