import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; 

const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    username: string;
}

export function generateToken(payload: JWTPayload): string {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}