import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePermission } from '@/lib/rbac/api-guard';
import { canCreateRole } from '@/lib/rbac/user-permissions';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { sendNewAccountEmail } from '@/lib/email';
import { UserRole } from '@/types/user.types';

// Helper function to generate temp password
function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// GET - List employees
export async function GET(request: NextRequest) {
    const { authorized, user, response } = await requirePermission(
        request,
        'employees:view'
    );

    if (!authorized) return response;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role');
        const isActive = searchParams.get('isActive');

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                { username: { contains: search, mode: 'insensitive' as const } },
            ];
        }

        if (role && role !== 'all') {
            where.role = role;
        }

        if (isActive !== null && isActive !== undefined && isActive !== 'all') {
            where.isActive = isActive === 'true';
        }

        if (user.role === 'MANAGER') {
            where.role = 'CASHIER';
        }

        const employees = await prisma.user.findMany({
            where,
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
                lastLogin: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, employees });
    } catch (error) {
        console.error('Get employees error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}

// POST - Create employee
const createEmployeeSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']),
});

export async function POST(request: NextRequest) {
    const { authorized, user, response } = await requirePermission(
        request,
        'employees:create_cashier'
    );

    if (!authorized) return response;

    try {
        const body = await request.json();
        const validatedData = createEmployeeSchema.parse(body);

        const userRole = user.role as UserRole;
        const targetRole = validatedData.role as UserRole;

        if (!canCreateRole(userRole, targetRole)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `You cannot create ${targetRole} accounts`,
                },
                { status: 403 }
            );
        }

        // Generate temp password
        const tempPassword = generateTempPassword();

        const passwordValidation = validatePassword(tempPassword);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Generated password does not meet requirements',
                },
                { status: 500 }
            );
        }

        const existingUsername = await prisma.user.findUnique({
            where: { username: validatedData.username },
        });

        if (existingUsername) {
            return NextResponse.json(
                { success: false, message: 'Username already exists' },
                { status: 400 }
            );
        }

        const existingEmail = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingEmail) {
            return NextResponse.json(
                { success: false, message: 'Email already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(tempPassword);

        const employee = await prisma.user.create({
            data: {
                username: validatedData.username,
                email: validatedData.email,
                name: validatedData.name,
                phone: validatedData.phone,
                role: targetRole,
                password: hashedPassword,
                isActive: true,
                status: 'ACTIVE',
                mustChangePassword: true,
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });

        // 📧 Send welcome email with temp password (fire and forget)
        sendNewAccountEmail({
            email: employee.email,
            name: employee.name,
            username: employee.username,
            temporaryPassword: tempPassword,
            role: employee.role,
        })
            .then((result) => {
                if (result.success) {
                    console.log('✅ Welcome email sent to:', employee.email);
                    console.log('📧 Message ID:', result.messageId);
                } else {
                    console.error('❌ Failed to send email to:', employee.email);
                    console.error('Error:', result.error);
                }
            })
            .catch((error) => {
                console.error('❌ Email sending error:', error);
            });

        if (process.env.NODE_ENV === 'development') {
            console.log('🔑 Temporary password:', tempPassword);
        }

        return NextResponse.json(
            {
                success: true,
                message: `Employee created successfully. Login credentials have been sent to ${employee.email}`,
                employee,
                temporaryPassword: tempPassword, // Fallback if email fails
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

        console.error('Create employee error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create employee' },
            { status: 500 }
        );
    }
}