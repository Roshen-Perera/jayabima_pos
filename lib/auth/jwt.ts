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