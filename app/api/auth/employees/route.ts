import { requirePermission } from "@/lib/rbac/api-guard";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { authorized, user, response } = await requirePermission(
        request,
        'employees:view'
    );
    if (!authorized) return response;
}