import { requirePermission } from "@/lib/rbac/api-guard";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";


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
    } catch (error) {
        
    }
}