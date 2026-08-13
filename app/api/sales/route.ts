import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac/api-guard';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const saleItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.coerce.number().int().positive(),
    price: z.coerce.number().nonnegative(),
    total: z.coerce.number().nonnegative(),
});

const createSaleSchema = z.object({
    customerId: z.string().optional().nullable(),
    customerName: z.string().optional().nullable(),
    userId: z.string(),
    originalTotal: z.coerce.number().nonnegative(),
    itemDiscount: z.coerce.number().nonnegative().default(0),
    discount: z.coerce.number().nonnegative().default(0),
    totalSavings: z.coerce.number().nonnegative().default(0),
    total: z.coerce.number().nonnegative(),
    paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT', 'MOBILE', 'OTHER']),
    cashPaid: z.coerce.number().nonnegative().optional().nullable(),
    cashBalance: z.coerce.number().optional().nullable(),
    reference: z.string().optional().nullable(),
    chequeDate: z.string().optional().nullable(),
    status: z.enum(['COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED']).default('COMPLETED'),
    items: z.array(saleItemSchema).min(1),
});

/**
 * GET /api/sales?customerId=xxx&limit=50
 * Returns persisted sales from the database.
 */
export async function GET(request: NextRequest) {
    const { authorized, response } = await requirePermission(request, 'sales:view');
    if (!authorized) return response;

    try {
        const customerId = request.nextUrl.searchParams.get('customerId');
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');

        const sales = await prisma.sale.findMany({
            where: {
                ...(customerId ? { customerId } : {}),
                deletedAt: null,
            },
            include: {
                items: true,
                customer: { select: { id: true, name: true } },
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
    }
}

/**
 * POST /api/sales
 * Persists a completed sale to the database atomically:
 * - Creates Sale record with all SaleItems
 * - Decrements stock for each product sold
 * - Increments customer.totalPurchases if linked to a customer
 * - Increments customer.creditBalance if paid with CREDIT
 */
export async function POST(request: NextRequest) {
    const { authorized, response, user: authUser } = await requirePermission(request, 'pos:create_sale');
    if (!authorized) return response;

    try {
        const body = await request.json();

        // Use server-side authenticated user id (don't trust client-supplied userId)
        const bodyWithAuthUser = { ...body, userId: authUser?.id ?? body.userId };
        const data = createSaleSchema.parse(bodyWithAuthUser);

        if (data.paymentMethod === 'CREDIT' && !data.customerId) {
            return NextResponse.json(
                { error: 'A customer account must be selected for Credit sales.' },
                { status: 400 }
            );
        }

        // 1. Create the sale & items
        const sale = await prisma.sale.create({
            data: {
                customerId: data.customerId || null,
                userId: data.userId,
                originalTotal: data.originalTotal,
                itemDiscount: data.itemDiscount,
                discount: data.discount,
                totalSavings: data.totalSavings,
                total: data.total,
                paymentMethod: data.paymentMethod,
                cashPaid: data.cashPaid ?? null,
                cashBalance: data.cashBalance ?? null,
                reference: data.reference || null,
                chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
                status: data.status,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                    })),
                },
            },
            include: {
                items: true,
                customer: { select: { id: true, name: true } },
            },
        });

        // 2. Decrement product stock for each item
        await Promise.all(
            data.items.map((item) =>
                prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                })
            )
        );

        // 3. Sync customer: increment totalPurchases & creditBalance (if CREDIT sale)
        if (data.customerId) {
            const isCredit = data.paymentMethod === 'CREDIT';
            await prisma.customer.update({
                where: { id: data.customerId },
                data: {
                    totalPurchases: { increment: data.total },
                    ...(isCredit && {
                        creditBalance: { increment: data.total },
                    }),
                },
            });
        }

        return NextResponse.json(sale, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Sale validation error:', JSON.stringify(error.issues, null, 2));
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating sale:', error);
        return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
    }
}
