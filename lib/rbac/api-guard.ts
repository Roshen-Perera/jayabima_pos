import { NextRequest, NextResponse } from "next/server";
import { Permission } from "./permissions";

export async function requirePermission(
    request: NextRequest,
    permission: Permission
): Promise<{ authorized: boolean; user?: any; response?: NextResponse }> {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            ),
        };
    }
}