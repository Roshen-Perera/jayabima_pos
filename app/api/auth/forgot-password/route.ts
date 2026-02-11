import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth/jwt';
import { sendPasswordResetEmail } from '@/lib/email';

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
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No account found with this email address.',
                },
                { status: 404 }
            );
        }
        if (!user.isActive || user.status !== 'ACTIVE') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'This account is inactive or suspended. Please contact support.',
                },
                { status: 403 }
            );
        }

        const resetToken = generateResetToken(user.id);
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            resetToken,
        })
            .then((result) => {
                if (result.success) {
                    console.log('✅ Password reset email sent to:', user.email);
                    console.log('📧 Message ID:', result.messageId);
                } else {
                    console.error('❌ Failed to send email to:', user.email);
                    console.error('Error:', result.error);
                }
            })
            .catch((error) => {
                console.error('❌ Email sending error:', error);
            });
        if (process.env.NODE_ENV === 'development') {
            console.log('🔑 Password reset token:', resetToken);
            console.log(
                '🔗 Reset link:',
                `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
            );
        }
        return NextResponse.json(
            {
                success: true,
                message: 'Password reset link has been sent to your email.'
            },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation error',
                    errors: error.issues.map((e) => e.message),
                },
                { status: 400 }
            );
        }
        console.error('Forgot password error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}