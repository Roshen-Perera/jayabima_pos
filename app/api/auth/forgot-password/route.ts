import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateResetToken } from '@/lib/auth/jwt';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});