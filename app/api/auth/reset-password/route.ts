import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { verifyResetToken } from '@/lib/auth/jwt';

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = resetPasswordSchema.parse(body);
        const passwordValidation = validatePassword(validatedData.password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Password does not meet requirements',
                    errors: passwordValidation.errors,
                },
                { status: 400 }
            );
        }
        const userId = verifyResetToken(validatedData.token);
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid or expired reset token',
                },
                { status: 400 }
            );
        }
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                resetToken: validatedData.token,
                resetTokenExpiry: {
                    gte: new Date(),
                },
            },
        });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid or expired reset token',
                },
                { status: 400 }
            );
        }
        const hashedPassword = await hashPassword(validatedData.password);

    } catch (error) {

    }
}