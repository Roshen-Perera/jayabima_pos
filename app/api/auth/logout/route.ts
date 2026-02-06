import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth/session';

export async function POST() {
    try {
        await deleteAuthCookie();
        return NextResponse.json(
            {
                success: true,
                message: 'Logout successful',
            },
            { status: 200 }
        );
    } catch (error) {

    }
}