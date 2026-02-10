import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes (don't require authentication)
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Define auth routes (redirect to dashboard if already logged in)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
}