import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac/api-guard';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, user, response } = await requirePermission(request, 'suppliers:update');
    if (!authorized || !user) return response;
    try {
        const { id } = await params;
        const userId = user.id || user.userId;

        // Fetch Purchase Order
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                items: true,
                supplier: true,
            },
        });

        if (!po) {
            return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
        }

        if (po.status === 'RECEIVED') {
            return NextResponse.json({ error: 'Purchase Order has already been received' }, { status: 400 });
        }

        if (po.status === 'CANCELLED') {
            return NextResponse.json({ error: 'Cannot receive a cancelled Purchase Order' }, { status: 400 });
        }

        // Parse optional payment settlement details from request body
        let paymentTerm = 'CREDIT';
        let paidAmount = 0;
        let paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' = 'CASH';
        let reference: string | null = null;
        let chequeDate: Date | null = null;

        try {
            const body = await request.json();
            if (body && body.paymentTerm) {
                paymentTerm = body.paymentTerm;
                if (paymentTerm === 'CASH') {
                    paidAmount = Number(po.totalAmount);
                    paymentMethod = 'CASH';
                } else if (paymentTerm === 'CHEQUE') {
                    paidAmount = Number(po.totalAmount);
                    paymentMethod = 'CHEQUE';
                    reference = body.reference || null;
                    chequeDate = body.chequeDate ? new Date(body.chequeDate) : null;
                } else if (paymentTerm === 'BANK_TRANSFER') {
                    paidAmount = Number(po.totalAmount);
                    paymentMethod = 'BANK_TRANSFER';
                    reference = body.reference || null;
                } else if (paymentTerm === 'PARTIAL') {
                    paidAmount = Math.min(Number(po.totalAmount), Math.max(0, Number(body.paidAmount || 0)));
                    paymentMethod = body.paymentMethod || 'CASH';
                    reference = body.reference || null;
                    chequeDate = body.chequeDate ? new Date(body.chequeDate) : null;
                }
            }
        } catch {
            // Body empty or invalid JSON -> defaults to CREDIT
        }

        const netCreditAmount = Number(po.totalAmount) - paidAmount;

        // Execute receiving in a database transaction
        const updatedPO = await prisma.$transaction(async (tx) => {
            // 1. Update PO status
            const updated = await tx.purchaseOrder.update({
                where: { id },
                data: {
                    status: 'RECEIVED',
                    receivedAt: new Date(),
                },
                include: {
                    supplier: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            // 2. Update stock & inventory logs for each product
            for (const item of po.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (product) {
                    const previousStock = product.stock;
                    const newStock = previousStock + item.quantity;

                    // Update product stock and supplier link if unlinked
                    await tx.product.update({
                        where: { id: product.id },
                        data: {
                            stock: newStock,
                            cost: item.cost,
                            supplierId: product.supplierId || po.supplierId,
                        },
                    });

                    // Create inventory log
                    await tx.inventoryLog.create({
                        data: {
                            productId: product.id,
                            userId: userId || null,
                            quantityChange: item.quantity,
                            previousStock,
                            newStock,
                            reason: 'PURCHASE',
                            note: `Received from Purchase Order ${po.orderNumber}`,
                        },
                    });
                }
            }

            // 3. Update supplier payable balance (only by net credit amount)
            if (netCreditAmount !== 0) {
                await tx.supplier.update({
                    where: { id: po.supplierId },
                    data: {
                        payableBalance: {
                            increment: netCreditAmount,
                        },
                    },
                });
            }

            // 4. If an upfront/immediate payment was made, record SupplierPayment
            if (paidAmount > 0) {
                await tx.supplierPayment.create({
                    data: {
                        supplierId: po.supplierId,
                        amount: paidAmount,
                        method: paymentMethod,
                        reference,
                        chequeDate,
                        note: `Settlement at receipt of PO ${po.orderNumber}`,
                        paidAt: new Date(),
                    },
                });
            }

            return updated;
        });

        return NextResponse.json(updatedPO);
    } catch (error) {
        console.error('Error receiving purchase order:', error);
        return NextResponse.json(
            { error: 'Failed to receive purchase order' },
            { status: 500 }
        );
    }
}

