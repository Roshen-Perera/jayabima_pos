import { NextRequest, NextResponse } from "next/server";
import { hasAnyPermission, hasPermission, Permission, UserRole } from "./permissions";
import { verifyToken } from "../auth/jwt";

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

    const user = await verifyToken(token);

    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            ),
        };
    }

    const userRole = user.role as UserRole;

    if (!hasPermission(userRole, permission)) {
        return {
            authorized: false,
            response: NextResponse.json(
                {
                    success: false,
                    message: 'Forbidden: You do not have permission to perform this action',
                },
                { status: 403 }
            ),
        };
    }

    return { authorized: true, user };
}

export async function requireAnyPermission(
    request: NextRequest,
    permissions: Permission[]
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
    const user = await verifyToken(token);
    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            ),
        };
    }
    const userRole = user.role as UserRole;
    if (!hasAnyPermission(userRole, permissions)) {
        return {
            authorized: false,
            response: NextResponse.json(
                {
                    success: false,
                    message: 'Forbidden: You do not have permission to perform this action',
                },
                { status: 403 }
            ),
        };
    }
    return { authorized: true, user };
}

export async function requireRole(
    request: NextRequest,
    allowedRoles: UserRole[]
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
    const user = await verifyToken(token);
    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            ),
        };
    }
}