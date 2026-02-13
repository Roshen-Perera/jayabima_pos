import { generateToken } from '@/lib/auth/jwt';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { setAuthCookie } from '@/lib/auth/session';
import { sendWelcomeEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = registerSchema.parse(body);
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

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { username: validatedData.username },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        existingUser.email === validatedData.email
                            ? 'Email already registered'
                            : 'Username already taken',
                },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(validatedData.password);

        const user = await prisma.user.create({
            data: {
                username: validatedData.username,
                email: validatedData.email,
                password: hashedPassword,
                name: validatedData.name,
                phone: validatedData.phone,
                role: validatedData.role || 'CASHIER',
                isActive: true,
                status: 'ACTIVE',
            },
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
            },
        });

        const token = await generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
        });

        await setAuthCookie(token);

        sendWelcomeEmail(user.email, user.name)
            .then((result) => {
                if (result.success) {
                    console.log('✅ Welcome email sent to:', user.email);
                }
            })
            .catch((error) => console.error('❌ Failed to send welcome email:', error));

        return NextResponse.json(
            {
                success: true,
                message: 'Registration successful',
                user,
                token,
            },
            { status: 201 }
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

        console.error('Registration error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        );
    }
}