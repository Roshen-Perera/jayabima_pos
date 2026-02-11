import { NextRequest } from 'next/server';
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
        if (user) {
            const resetToken = generateResetToken(user.id);
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
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
                    } else {
                        console.error('❌ Failed to send password reset email:', result.error);
                    }
                })
                .catch((error) => {
                    console.error('❌ Email sending error:', error);
                });
        }
    } catch (error) {

    }
}