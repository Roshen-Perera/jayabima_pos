import { requirePermission } from "@/lib/rbac/api-guard";
import { NextRequest } from "next/server";

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
    } catch (error) {}
}