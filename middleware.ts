import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Auth routes that require authentication
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {

}