import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
    } catch (error) {

    }
}