import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './jwt';

const AUTH_COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds