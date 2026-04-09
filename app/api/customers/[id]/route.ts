import { prisma } from '@/lib/prisma';
import { customerSchema } from '@/app/customers/lib/validation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const validatedData = customerSchema.partial().parse(body);
        const customer = await prisma.customer.update({
            where: { id },
            data: validatedData,
        });
        return NextResponse.json(customer);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error },
                { status: 400 }
            );
        }
    }
}