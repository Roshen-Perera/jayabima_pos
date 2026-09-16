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

const paymentLineSchema = z.object({
    method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE']),
    amount: z.coerce.number().positive(),
    reference: z.string().optional().nullable(),
    chequeDate: z.string().optional().nullable(),
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
    paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT', 'SPLIT', 'PARTIAL']),
    cashPaid: z.coerce.number().nonnegative().optional().nullable(),
    cashBalance: z.coerce.number().optional().nullable(),
    excessHandling: z.enum(['CHANGE', 'CREDIT_BALANCE']).optional().default('CHANGE'),
    excessAmount: z.coerce.number().nonnegative().optional().default(0),
    reference: z.string().optional().nullable(),
    chequeDate: z.string().optional().nullable(),
    status: z.enum(['COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED']).default('COMPLETED'),
    items: z.array(saleItemSchema).min(1),
    payments: z.array(paymentLineSchema).optional(),
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
 * Persists a completed sale to the database:
 * - Creates Sale record with all SaleItems
 * - Decrements stock for each product sold
 * - Creates CustomerPayment ledger records for paid portions (cash, cheques, transfers)
 * - Increments customer.totalPurchases and updates customer.creditBalance for unpaid portions
 */
export async function POST(request: NextRequest) {
    const { authorized, response, user: authUser } = await requirePermission(request, 'pos:create_sale');
    if (!authorized) return response;

    try {
        const body = await request.json();

        // Use server-side authenticated user id (don't trust client-supplied userId)
        const bodyWithAuthUser = { ...body, userId: authUser?.id ?? body.userId };
        const data = createSaleSchema.parse(bodyWithAuthUser);

        if ((data.paymentMethod === 'CREDIT' || data.paymentMethod === 'CHEQUE' || data.paymentMethod === 'SPLIT' || data.paymentMethod === 'PARTIAL') && !data.customerId) {
            return NextResponse.json(
                { error: 'Walking Customers can pay via Cash, Card, or Bank Transfer. Please select a registered customer for Credit, Cheque, or Split payments.' },
                { status: 400 }
            );
        }

        // Determine primary payment method for Sale record
        let dbPaymentMethod: any = data.paymentMethod;
        if (data.paymentMethod === 'SPLIT' || data.paymentMethod === 'PARTIAL') {
            let paidUpfront = 0;
            if (data.payments && data.payments.length > 0) {
                paidUpfront = data.payments.reduce((sum, p) => sum + p.amount, 0);
            }
            const remainder = data.total - paidUpfront;
            if (remainder > 0) {
                dbPaymentMethod = 'CREDIT';
            } else {
                dbPaymentMethod = (data.payments && data.payments[0]?.method) || 'CASH';
            }
        }

        // Execute sale and stock deduction in a database transaction
        const sale = await prisma.$transaction(async (tx) => {
            // 1. Calculate FIFO cost for each item and consume batches
            const itemsWithCost: Array<{
                productId: string;
                productName: string;
                quantity: number;
                price: number;
                cost: number;
                total: number;
            }> = [];

            for (const item of data.items) {
                // Find all available batches for this product ordered by oldest first
                const batches = await tx.stockBatch.findMany({
                    where: { productId: item.productId, remainingQty: { gt: 0 } },
                    orderBy: { createdAt: 'asc' },
                });

                let qtyNeeded = item.quantity;
                let totalCost = 0;

                for (const batch of batches) {
                    if (qtyNeeded <= 0) break;
                    const take = Math.min(qtyNeeded, batch.remainingQty);
                    totalCost += take * Number(batch.cost);
                    qtyNeeded -= take;

                    await tx.stockBatch.update({
                        where: { id: batch.id },
                        data: { remainingQty: { decrement: take } },
                    });
                }

                // If some units are not covered by batches (legacy inventory), use catalog cost
                if (qtyNeeded > 0) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                        select: { cost: true },
                    });
                    const fallbackCost = product ? Number(product.cost) : 0;
                    totalCost += qtyNeeded * fallbackCost;
                }

                const unitCost = item.quantity > 0 ? totalCost / item.quantity : 0;

                itemsWithCost.push({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    cost: unitCost,
                    total: item.total,
                });

                // Decrement product stock and record inventory audit log
                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                    select: { stock: true },
                });

                await tx.inventoryLog.create({
                    data: {
                        productId: item.productId,
                        userId: data.userId || null,
                        quantityChange: -item.quantity,
                        previousStock: updatedProduct.stock + item.quantity,
                        newStock: updatedProduct.stock,
                        reason: 'SALE',
                        note: `POS Sale: ${item.quantity}x ${item.productName}`,
                    },
                });
            }

            // 2. Create the sale & items with recorded costs
            const createdSale = await tx.sale.create({
                data: {
                    customerId: data.customerId || null,
                    userId: data.userId,
                    originalTotal: data.originalTotal,
                    itemDiscount: data.itemDiscount,
                    discount: data.discount,
                    totalSavings: data.totalSavings,
                    total: data.total,
                    paymentMethod: dbPaymentMethod,
                    cashPaid: data.cashPaid ?? null,
                    cashBalance: data.cashBalance ?? null,
                    reference: data.reference || null,
                    chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
                    status: data.status,
                    items: {
                        create: itemsWithCost.map((item) => ({
                            productId: item.productId,
                            productName: item.productName,
                            quantity: item.quantity,
                            price: item.price,
                            cost: item.cost,
                            total: item.total,
                        })),
                    },
                },
                include: {
                    items: true,
                    customer: { select: { id: true, name: true } },
                },
            });

            // 3. Sync customer ledger: record payments and credit balance
            if (data.customerId) {
                let totalPaidUpfront = 0;

                if (data.payments && data.payments.length > 0) {
                    for (const p of data.payments) {
                        totalPaidUpfront += p.amount;
                        if (p.method === 'CASH' || p.method === 'CHEQUE' || p.method === 'BANK_TRANSFER') {
                            await tx.customerPayment.create({
                                data: {
                                    customerId: data.customerId,
                                    amount: p.amount,
                                    method: p.method === 'CHEQUE' ? 'CHEQUE' : p.method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CASH',
                                    reference: p.reference || null,
                                    chequeDate: p.chequeDate ? new Date(p.chequeDate) : null,
                                    note: `POS Sale #${createdSale.id.substring(0, 8)} payment line (${p.method})`,
                                },
                            });
                        }
                    }
                } else if (data.paymentMethod === 'CASH' || data.paymentMethod === 'CHEQUE' || data.paymentMethod === 'BANK_TRANSFER') {
                    totalPaidUpfront = data.total;
                    await tx.customerPayment.create({
                        data: {
                            customerId: data.customerId,
                            amount: data.total,
                            method: data.paymentMethod === 'CHEQUE' ? 'CHEQUE' : data.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CASH',
                            reference: data.reference || null,
                            chequeDate: data.chequeDate ? new Date(data.chequeDate) : null,
                            note: `POS Sale #${createdSale.id.substring(0, 8)} full payment (${data.paymentMethod})`,
                        },
                    });
                }

                const remainderUnpaid = Math.max(0, data.total - totalPaidUpfront);

                // Handle excess payment transfer to credit balance if customer opted for it
                const hasExcessCredit = data.excessHandling === 'CREDIT_BALANCE' && (data.excessAmount ?? 0) > 0;
                const excessCreditAmt = hasExcessCredit ? (data.excessAmount ?? 0) : 0;

                if (excessCreditAmt > 0) {
                    await tx.customerPayment.create({
                        data: {
                            customerId: data.customerId,
                            amount: excessCreditAmt,
                            method: 'CASH',
                            note: `POS Sale #${createdSale.id.substring(0, 8)} excess change credited to account balance`,
                        },
                    });
                }

                await tx.customer.update({
                    where: { id: data.customerId },
                    data: {
                        totalPurchases: { increment: data.total },
                        ...(remainderUnpaid > 0 && {
                            creditBalance: { increment: remainderUnpaid },
                        }),
                        ...(excessCreditAmt > 0 && {
                            creditBalance: { decrement: excessCreditAmt },
                        }),
                    },
                });
            }

            return createdSale;
        });

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
