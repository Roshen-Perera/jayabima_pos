import { purchaseOrderSchema } from '@/app/suppliers/lib/validation';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac/api-guard';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    const { authorized, response } = await requirePermission(request, 'suppliers:view');
    if (!authorized) return response;
    try {
        const searchParams = request.nextUrl.searchParams;
        const supplierId = searchParams.get('supplierId');
        const status = searchParams.get('status');

        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where: {
                ...(supplierId ? { supplierId } : {}),
                ...(status ? { status: status as any } : {}),
            },
            include: {
                supplier: {
                    select: { id: true, name: true, phone: true, email: true },
                },
                user: {
                    select: { id: true, name: true, username: true },
                },
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, sku: true, cost: true, price: true, stock: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(purchaseOrders);
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { authorized, user, response } = await requirePermission(request, 'suppliers:create');
    if (!authorized || !user) return response;
    try {
        const body = await request.json();
        const validatedData = purchaseOrderSchema.parse(body);

        // Find or fallback user ID
        const userId = user.id || user.userId;
        if (!userId) {
            return NextResponse.json({ error: 'User ID missing in token' }, { status: 401 });
        }

        // Calculate total amount
        const totalAmount = validatedData.items.reduce(
            (acc, item) => acc + item.quantity * item.cost,
            0
        );

        // Generate Order Number PO-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `PO-${dateStr}-${randomNum}`;

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                orderNumber,
                supplierId: validatedData.supplierId,
                userId: userId,
                totalAmount: totalAmount,
                status: 'ORDERED',
                note: validatedData.note || null,
                expectedDate: validatedData.expectedDate ? new Date(validatedData.expectedDate) : null,
                items: {
                    create: validatedData.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        cost: item.cost,
                        total: item.quantity * item.cost,
                    })),
                },
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

        return NextResponse.json(purchaseOrder, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Error creating purchase order:', error);
        return NextResponse.json(
            { error: 'Failed to create purchase order' },
            { status: 500 }
        );
    }
}
