import { requirePermission } from "@/lib/rbac/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from "zod";


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