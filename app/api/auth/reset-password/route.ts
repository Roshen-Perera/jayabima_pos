import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { verifyResetToken } from '@/lib/auth/jwt';

// Validation schema
const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Validate input
        const validatedData = resetPasswordSchema.parse(body);
        // Validate password strength
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

        // Verify reset token and get user ID
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

        // Find user with matching reset token
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

        // Hash new password
        const hashedPassword = await hashPassword(validatedData.password);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
    } catch (error) {

    }
}