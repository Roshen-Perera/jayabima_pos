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

            // 3. Update supplier payable balance
            await tx.supplier.update({
                where: { id: po.supplierId },
                data: {
                    payableBalance: {
                        increment: po.totalAmount,
                    },
                },
            });

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
