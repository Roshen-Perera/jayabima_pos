import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { verifyResetToken } from '@/lib/auth/jwt';
import { getCurrentUser } from '@/lib/auth/session';


export async function GET() {
    try {
        const session = await getCurrentUser();

    } catch (error) {

    }
}
