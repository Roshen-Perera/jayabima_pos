import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes (don't require authentication)
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];