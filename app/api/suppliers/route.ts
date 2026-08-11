import { supplierSchema } from '@/app/suppliers/lib/validation';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac/api-guard';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

export async function GET(request: NextRequest) {
    const { authorized, response } = await requirePermission(request, 'suppliers:view');
    if (!authorized) return response;
    try {
        const searchParams = request.nextUrl.searchParams;
        const includeInactive = searchParams.get('includeInactive') === 'true';
        const search = searchParams.get('search') || '';

        const suppliers = await prisma.supplier.findMany({
            where: {
                deletedAt: null,
                ...(includeInactive ? {} : { active: true }),
                ...(search
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { contactPerson: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                            { phone: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            include: {
                _count: {
                    select: {
                        products: true,
                        purchaseOrders: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { authorized, response } = await requirePermission(request, 'suppliers:create');
    if (!authorized) return response;
    try {
        const body = await request.json();
        const validatedData = supplierSchema.parse(body);

        const supplier = await prisma.supplier.create({
            data: {
                name: validatedData.name,
                contactPerson: validatedData.contactPerson || null,
                email: validatedData.email || null,
                phone: validatedData.phone || null,
                address: validatedData.address || null,
                payableBalance: validatedData.payableBalance || 0,
                taxId: validatedData.taxId || null,
                bankName: validatedData.bankName || null,
                accountNumber: validatedData.accountNumber || null,
                active: validatedData.active !== undefined ? validatedData.active : true,
            },
        });

        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating supplier:', error);
        return NextResponse.json(
            { error: 'Failed to create supplier' },
            { status: 500 }
        );
    }
}
