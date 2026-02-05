import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './jwt';

const AUTH_COOKIE_NAME = 'auth-token';