import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
