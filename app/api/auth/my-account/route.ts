import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import z from 'zod';


export async function GET() {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Not authenticated',
                },
                { status: 401 }
            );
        }
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                lastLogin: true,
            },
        });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }
        if (!user.isActive || user.status !== 'ACTIVE') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Account is inactive or suspended',
                },
                { status: 403 }
            );
        }
        return NextResponse.json(
            {
                success: true,
                user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }
        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);
        const existingUser = await prisma.user.findFirst({
            where: {
                email: validatedData.email,
                NOT: { id: session.userId },
            },
        });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'Email already in use' },
                { status: 400 }
            );
        }
        const user = await prisma.user.update({
            where: { id: session.userId },
            data: {
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone,
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user,
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
    }
}