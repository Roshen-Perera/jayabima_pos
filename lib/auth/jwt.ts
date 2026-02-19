import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';

const JWT_SECRET = (() => {
    const value = process.env.JWT_SECRET;
    if (!value) {
        throw new Error("JWT_SECRET is missing");
    }
    return new TextEncoder().encode(value);
})();

const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JWTPayload extends JoseJWTPayload {
    userId: string;
    email: string;
    role: string;
    username: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as JWTPayload;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

export async function generateResetToken(userId: string): Promise<string> {
    return await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(JWT_SECRET);
}

export async function verifyResetToken(token: string): Promise<string | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return (payload as { userId: string }).userId;
    } catch (error) {
        console.error('Reset token verification failed:', error);
        return null;
    }
}