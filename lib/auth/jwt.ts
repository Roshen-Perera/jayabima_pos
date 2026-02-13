import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = (() => {
    const value = process.env.JWT_SECRET;
    if (!value) {
        throw new Error("JWT_SECRET is missing");
    }
    return value;
})();


const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    username: string;
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

export function generateResetToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '1h',
    });
}

export function verifyResetToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch (error) {
        console.error('Reset token verification failed:', error);
        return null;
    }
}