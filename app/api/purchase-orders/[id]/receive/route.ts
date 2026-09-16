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

        // Parse payment settlement details from request body
        interface PaymentItemToCreate {
            method: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';
            amount: number;
            reference: string | null;
            chequeDate: Date | null;
        }

        interface PriceUpdateItem {
            productId: string;
            newPrice?: number;
        }

        let paymentsToCreate: PaymentItemToCreate[] = [];
        let priceUpdates: PriceUpdateItem[] = [];

        try {
            const body = await request.json();
            if (body) {
                if (Array.isArray(body.priceUpdates)) {
                    priceUpdates = body.priceUpdates;
                }
                if (Array.isArray(body.payments) && body.payments.length > 0) {
                    paymentsToCreate = body.payments
                        .map((p: any) => ({
                            method: (p.method || 'CASH') as 'CASH' | 'BANK_TRANSFER' | 'CHEQUE',
                            amount: Math.max(0, Number(p.amount) || 0),
                            reference: p.reference || null,
                            chequeDate: p.chequeDate ? new Date(p.chequeDate) : null,
                        }))
                        .filter((p: PaymentItemToCreate) => p.amount > 0);
                } else if (body.paymentTerm) {
                    const term = body.paymentTerm;
                    const poTotal = Number(po.totalAmount);
                    if (term === 'CASH') {
                        paymentsToCreate.push({ method: 'CASH', amount: poTotal, reference: null, chequeDate: null });
                    } else if (term === 'CHEQUE') {
                        paymentsToCreate.push({
                            method: 'CHEQUE',
                            amount: poTotal,
                            reference: body.reference || null,
                            chequeDate: body.chequeDate ? new Date(body.chequeDate) : null,
                        });
                    } else if (term === 'BANK_TRANSFER') {
                        paymentsToCreate.push({
                            method: 'BANK_TRANSFER',
                            amount: poTotal,
                            reference: body.reference || null,
                            chequeDate: null,
                        });
                    } else if (term === 'PARTIAL') {
                        const paid = Math.min(poTotal, Math.max(0, Number(body.paidAmount || 0)));
                        if (paid > 0) {
                            paymentsToCreate.push({
                                method: body.paymentMethod || 'CASH',
                                amount: paid,
                                reference: body.reference || null,
                                chequeDate: body.chequeDate ? new Date(body.chequeDate) : null,
                            });
                        }
                    }
                }
            }
        } catch {
            // Body empty or invalid JSON -> defaults to CREDIT (0 payments)
        }

        const totalPaid = paymentsToCreate.reduce((acc, p) => acc + p.amount, 0);
        const netCreditAmount = Number(po.totalAmount) - totalPaid;

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

            // 2. Update stock, batches & inventory logs for each product
            for (const item of po.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (product) {
                    const previousStock = product.stock;
                    const newStock = previousStock + item.quantity;

                    // Create stock batch for FIFO tracking
                    await tx.stockBatch.create({
                        data: {
                            productId: product.id,
                            purchaseOrderId: po.id,
                            batchNumber: `${po.orderNumber}-${product.sku || product.id.slice(-4)}`,
                            cost: item.cost,
                            quantity: item.quantity,
                            remainingQty: item.quantity,
                        },
                    });

                    // Check if price should be updated
                    const priceUpdate = priceUpdates.find((p) => p.productId === product.id);
                    const updateData: any = {
                        stock: newStock,
                        cost: item.cost,
                        supplierId: product.supplierId || po.supplierId,
                    };

                    if (priceUpdate && priceUpdate.newPrice !== undefined && Number(priceUpdate.newPrice) > 0) {
                        const newPriceVal = Number(priceUpdate.newPrice);
                        if (newPriceVal !== Number(product.price)) {
                            updateData.previousPrice = product.price;
                            updateData.price = newPriceVal;
                        }
                    }

                    // Update product
                    await tx.product.update({
                        where: { id: product.id },
                        data: updateData,
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
                            note: `Received from Purchase Order ${po.orderNumber} (Cost: Rs. ${item.cost})`,
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

            // 4. Create all payment records for immediate/split payments
            for (const p of paymentsToCreate) {
                await tx.supplierPayment.create({
                    data: {
                        supplierId: po.supplierId,
                        amount: p.amount,
                        method: p.method,
                        reference: p.reference,
                        chequeDate: p.chequeDate,
                        note: `Settlement at receipt of PO ${po.orderNumber}`,
                        paidAt: new Date(),
                    },
                });
            }

            return updated;
        }, {
            maxWait: 10000,
            timeout: 30000,
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

