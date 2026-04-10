import { customerSchema } from '@/app/customers/lib/validation';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const showInactive = searchParams.get('showInactive') === 'true';
        const customers = await prisma.customer.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = customerSchema.parse(body);
        const customer = await prisma.customer.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone,
                address: validatedData.address,
                creditBalance: 0,
                loyaltyPoints: 0,
                totalPurchases: 0,
            },
        });
        return NextResponse.json(customer, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error },
                { status: 400 }
            );
        }
        console.error('Error creating customer:', error);
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        );
    }
}