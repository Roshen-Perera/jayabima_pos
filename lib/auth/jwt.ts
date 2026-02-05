import jwt from 'jsonwebtoken';

const secret = (() => {
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
    return jwt.sign(payload, secret, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, secret) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

export function generateResetToken(userId: string): string {
    return jwt.sign({ userId }, secret, {
        expiresIn: '1h',
    });
}