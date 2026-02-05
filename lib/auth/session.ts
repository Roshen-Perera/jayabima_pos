import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './jwt';

const AUTH_COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function setAuthCookie(token: string): Promise<void> {
    (await cookies()).set(AUTH_COOKIE_NAME, token, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'lax', // Adjust as needed: 'lax', 'strict', or 'none'. lax means the cookie is sent on same-site requests and top-level navigation GET requests.
        maxAge: COOKIE_MAX_AGE, // 7 days in seconds
        path: '/', // Cookie is valid for the entire site
    });
}

export async function getAuthCookie(): Promise<string | undefined> {
    return (await cookies()).get(AUTH_COOKIE_NAME)?.value;
}

export async function deleteAuthCookie(): Promise<void> {
    (await cookies()).delete(AUTH_COOKIE_NAME);
}

