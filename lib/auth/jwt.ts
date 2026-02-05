import jwt from 'jsonwebtoken'; 

const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    username: string;
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: JWT_EXPIRES_IN,
    });
}