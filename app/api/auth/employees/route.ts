import { requirePermission } from "@/lib/rbac/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { UserRole } from "@/types/user.types";
import { canCreateRole } from "@/lib/rbac/user-permissions";
import { hashPassword, validatePassword } from "@/lib/auth/password";

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

const createEmployeeSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
    const { authorized, user, response } = await requirePermission(
        request,
        'employees:create'
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
        const hashedPassword = await hashPassword(validatedData.password);

    } catch (error) { }
}