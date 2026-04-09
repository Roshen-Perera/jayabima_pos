import { prisma } from '@/lib/prisma';
import { customerSchema } from '@/app/customers/lib/validation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

