import { getCurrentUser } from "@/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }
        const body = await request.json();
        const validatedData = changePasswordSchema.parse(body);
    } catch (error) {

    }
}