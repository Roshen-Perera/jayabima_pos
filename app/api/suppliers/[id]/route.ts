import { supplierSchema } from '@/app/suppliers/lib/validation';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac/api-guard';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, response } = await requirePermission(request, 'suppliers:view');
    if (!authorized) return response;
    try {
        const { id } = await params;
        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                products: true,
                purchaseOrders: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!supplier || supplier.deletedAt) {
            return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
        }

        return NextResponse.json(supplier);
    } catch (error) {
        console.error('Error fetching supplier:', error);
        return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, response } = await requirePermission(request, 'suppliers:update');
    if (!authorized) return response;
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = supplierSchema.partial().parse(body);

        const supplier = await prisma.supplier.update({
            where: { id },
            data: {
                ...validatedData,
                email: validatedData.email === '' ? null : validatedData.email,
                phone: validatedData.phone === '' ? null : validatedData.phone,
                taxId: validatedData.taxId === '' ? null : validatedData.taxId,
                bankName: validatedData.bankName === '' ? null : validatedData.bankName,
                accountNumber: validatedData.accountNumber === '' ? null : validatedData.accountNumber,
            },
        });

        return NextResponse.json(supplier);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error updating supplier:', error);
        return NextResponse.json(
            { error: 'Failed to update supplier' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, response } = await requirePermission(request, 'suppliers:delete');
    if (!authorized) return response;
    try {
        const { id } = await params;
        const supplier = await prisma.supplier.update({
            where: { id },
            data: {
                active: false,
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: 'Supplier soft-deleted successfully',
            supplier,
        });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return NextResponse.json(
            { error: 'Failed to delete supplier' },
            { status: 500 }
        );
    }
}
