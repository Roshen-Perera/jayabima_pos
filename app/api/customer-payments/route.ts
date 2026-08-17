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

        const customer = await prisma.customer.findUnique({
            where: { id: data.customerId },
            select: { id: true, name: true, creditBalance: true },
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Allow payment of any positive amount.
        // If customer has no debt or payment exceeds debt, the excess balance becomes an advance deposit (negative creditBalance).

        // Use an interactive transaction (callback form) to guarantee strict
        // sequential execution: decrement the balance first, then create the
        // payment record. This ensures payment.customer.creditBalance in the
        // response always reflects the post-payment (remaining) balance.
        const payment = await prisma.$transaction(async (tx) => {
            const updatedCustomer = await tx.customer.update({
                where: { id: data.customerId },
                data: { creditBalance: { decrement: data.amount } },
                select: { id: true, name: true, creditBalance: true, phone: true },
            });

            const created = await tx.customerPayment.create({
                data: {
                    customerId: data.customerId,
                    amount: data.amount,
                    method: data.method,
                    reference: data.reference || null,
                    chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
                    note: data.note || null,
                    paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
                },
            });

            // Attach the freshly-updated customer (with decremented balance) so
            // the receipt modal can display the correct remaining balance.
            return { ...created, customer: updatedCustomer };
        });

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
