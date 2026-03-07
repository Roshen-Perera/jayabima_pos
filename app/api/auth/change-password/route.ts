import { getCurrentUser } from "@/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword, verifyPassword } from "@/lib/auth/password";


const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }
        const body = await request.json();
        const validatedData = changePasswordSchema.parse(body);
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }
        const isValidPassword = await verifyPassword(
            validatedData.currentPassword,
            user.password
        );
        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, message: 'Current password is incorrect' },
                { status: 400 }
            );
        }
        const passwordValidation = validatePassword(validatedData.newPassword);
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
        const hashedPassword = await hashPassword(validatedData.newPassword);
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false, // Clear flag if it was set
            },
        });
        return NextResponse.json({
            success: true,
            message: 'Password changed successfully',
        });
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
        console.error('Change password error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}