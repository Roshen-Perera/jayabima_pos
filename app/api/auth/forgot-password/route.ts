import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth/jwt';
import { ca } from 'zod/v4/locales';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = forgotPasswordSchema.parse(body);
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (user) {
            const resetToken = generateResetToken(user.id);
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
        }
    } catch (error) {

    }
}