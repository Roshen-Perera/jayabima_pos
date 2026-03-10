import { requirePermission } from "@/lib/rbac/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/rbac/permissions";
import { canResetUserPassword } from "@/lib/rbac/user-permissions";
import { hashPassword } from "@/lib/auth/password";
import { sendPasswordResetByAdminEmail } from "@/lib/email";


function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { authorized, user, response } = await requirePermission(
        request,
        'employees:reset_password'
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
                {
                    success: false,
                    message: 'Use change password feature to update your own password',
                },
                { status: 400 }
            );
        }
        const userRole = user.role as UserRole;
        const targetRole = targetEmployee.role as UserRole;

        if (!canResetUserPassword(userRole, targetRole)) {
            return NextResponse.json(
                { success: false, message: "You cannot reset this user's password" },
                { status: 403 }
            );
        }

        const tempPassword = generateTempPassword();
        const hashedPassword = await hashPassword(tempPassword);

        await prisma.user.update({
            where: { id: params.id },
            data: {
                password: hashedPassword,
                mustChangePassword: true, // Force password change
            },
        });

        sendPasswordResetByAdminEmail({
            email: targetEmployee.email,
            name: targetEmployee.name,
            username: targetEmployee.username,
            temporaryPassword: tempPassword,
            resetBy: user.name, // Who reset the password
        })
            .then((result) => {
                if (result.success) {
                    console.log('✅ Password reset email sent to:', targetEmployee.email);
                    console.log('📧 Message ID:', result.messageId);
                } else {
                    console.error('❌ Failed to send email to:', targetEmployee.email);
                    console.error('Error:', result.error);
                }
            })
            .catch((error) => {
                console.error('❌ Email sending error:', error);
            });

        if (process.env.NODE_ENV === 'development') {
            console.log('🔑 Temporary password:', tempPassword);
            console.log('👤 Reset by:', user.name);
        }

        return NextResponse.json({
            success: true,
            message: `Password reset successfully. New credentials sent to ${targetEmployee.email}`,
            temporaryPassword: tempPassword, // Fallback if email fails
        });
    } catch (error) {
    }
}