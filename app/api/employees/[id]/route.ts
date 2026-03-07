import { requirePermission } from "@/lib/rbac/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { UserRole } from "@/types/user.types";
import { canEditUser } from "@/lib/rbac/user-permissions";


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { authorized, user, response } = await requirePermission(
        request,
        'employees:view'
    );

    if (!authorized) return response;

    try {
        const employee = await prisma.user.findUnique({
            where: { id: params.id },
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
        });
        if (!employee) {
            return NextResponse.json(
                { success: false, message: 'Employee not found' },
                { status: 404 }
            );
        }
        if (user.role === 'MANAGER' && employee.role !== 'CASHIER') {
            return NextResponse.json(
                { success: false, message: 'Access denied' },
                { status: 403 }
            );
        }
        return NextResponse.json({ success: true, employee });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Failed to fetch employee' },
            { status: 500 }
        );
    }
}

const updateEmployeeSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']).optional(),
    isActive: z.boolean().optional(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { authorized, user, response } = await requirePermission(
        request,
        'employees:update'
    );

    if (!authorized) return response;

    try {
        const body = await request.json();
        const validatedData = updateEmployeeSchema.parse(body);
        // Get target employee
        const targetEmployee = await prisma.user.findUnique({
            where: { id: params.id },
        });
        if (!targetEmployee) {
            return NextResponse.json(
                { success: false, message: 'Employee not found' },
                { status: 404 }
            );
        }
        // Check if user can edit this employee
        const isSelf = user.userId === params.id;
        const userRole = user.role as UserRole;
        const targetRole = targetEmployee.role as UserRole;
        if (!canEditUser(userRole, targetRole, isSelf)) {
            return NextResponse.json(
                { success: false, message: 'You cannot edit this employee' },
                { status: 403 }
            );
        }
        // Only admin can change roles
        if (validatedData.role && validatedData.role !== targetEmployee.role) {
            if (userRole !== 'ADMIN') {
                return NextResponse.json(
                    { success: false, message: 'Only admins can change roles' },
                    { status: 403 }
                );
            }
        }
        // Check email uniqueness if changing
        if (validatedData.email && validatedData.email !== targetEmployee.email) {
            const existingEmail = await prisma.user.findFirst({
                where: {
                    email: validatedData.email,
                    NOT: { id: params.id },
                },
            });

            if (existingEmail) {
                return NextResponse.json(
                    { success: false, message: 'Email already in use' },
                    { status: 400 }
                );
            }
        }
        const employee = await prisma.user.update({
            where: { id: params.id },
            data: validatedData,
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
        return NextResponse.json({
            success: true,
            message: 'Employee updated successfully',
            employee,
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
        console.error('Update employee error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update employee' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { authorized, user, response } = await requirePermission(
        request,
        'employees:delete'
    );

    if (!authorized) return response;

    try {
        const targetEmployee = await prisma.user.findUnique({
            where: { id: params.id },
        });
        if (!targetEmployee) {
            return NextResponse.json(
                { success: false, message: 'Employee not found' },
                { status: 404 }
            );
        }
        if (user.userId === params.id) {
            return NextResponse.json(
                { success: false, message: 'You cannot delete your own account' },
                { status: 400 }
            );
        }
    } catch (error) {

    }
}