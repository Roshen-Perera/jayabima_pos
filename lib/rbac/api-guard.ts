import { NextRequest, NextResponse } from "next/server";
import { Permission } from "./permissions";

export async function requirePermission(
    request: NextRequest,
    permission: Permission
): Promise<{ authorized: boolean; user?: any; response?: NextResponse }> {
    
}