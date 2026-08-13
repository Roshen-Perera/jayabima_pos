import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac/api-guard';
import { supplierPaymentSchema } from '@/app/suppliers/lib/validation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Reloaded Prisma client

/**
 * GET /api/supplier-payments?supplierId=xxx
 * Returns all payments for a supplier (or all if no filter), newest first.
 */
export async function GET(request: NextRequest) {
    const { authorized, response } = await requirePermission(request, 'suppliers:view');
    if (!authorized) return response;

    try {
        const supplierId = request.nextUrl.searchParams.get('supplierId');

        const payments = await prisma.supplierPayment.findMany({
            where: supplierId ? { supplierId } : {},
            include: {
                supplier: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { paidAt: 'desc' },
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error('Error fetching supplier payments:', error);
        return NextResponse.json({ error: 'Failed to fetch supplier payments' }, { status: 500 });
    }
}

/**
 * POST /api/supplier-payments
 * Records a payment against a supplier, decrementing their payableBalance.
 */
export async function POST(request: NextRequest) {
    const { authorized, response } = await requirePermission(request, 'suppliers:update');
    if (!authorized) return response;

    try {
        const body = await request.json();
        const data = supplierPaymentSchema.parse(body);

        const [payment] = await prisma.$transaction([
            prisma.supplierPayment.create({
                data: {
                    supplierId: data.supplierId,
                    amount: data.amount,
                    method: data.method,
                    reference: data.reference || null,
                    chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
                    note: data.note || null,
                    paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
                },
                include: {
                    supplier: { select: { id: true, name: true } },
                },
            }),
            prisma.supplier.update({
                where: { id: data.supplierId },
                data: {
                    payableBalance: {
                        decrement: data.amount,
                    },
                },
            }),
        ]);

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error recording supplier payment:', error);
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }
}
