import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac/api-guard';
import { customerPaymentSchema } from '@/app/customers/lib/validation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GET /api/customer-payments?customerId=xxx
 * Returns all payment records for a customer (or all if no filter), newest first.
 */
export async function GET(request: NextRequest) {
    const { authorized, response } = await requirePermission(request, 'customers:view');
    if (!authorized) return response;

    try {
        const customerId = request.nextUrl.searchParams.get('customerId');

        const payments = await prisma.customerPayment.findMany({
            where: customerId ? { customerId } : {},
            include: {
                customer: {
                    select: { id: true, name: true, creditBalance: true },
                },
            },
            orderBy: { paidAt: 'desc' },
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error('Error fetching customer payments:', error);
        return NextResponse.json({ error: 'Failed to fetch customer payments' }, { status: 500 });
    }
}

/**
 * POST /api/customer-payments
 * Records a payment received from a customer, decrementing their creditBalance.
 */
export async function POST(request: NextRequest) {
    const { authorized, response } = await requirePermission(request, 'customers:update');
    if (!authorized) return response;

    try {
        const body = await request.json();
        const data = customerPaymentSchema.parse(body);

        const [payment] = await prisma.$transaction([
            prisma.customerPayment.create({
                data: {
                    customerId: data.customerId,
                    amount: data.amount,
                    method: data.method,
                    reference: data.reference || null,
                    chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
                    note: data.note || null,
                    paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
                },
                include: {
                    customer: { select: { id: true, name: true, creditBalance: true } },
                },
            }),
            prisma.customer.update({
                where: { id: data.customerId },
                data: {
                    creditBalance: {
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
        console.error('Error recording customer payment:', error);
        return NextResponse.json({ error: 'Failed to record customer payment' }, { status: 500 });
    }
}
