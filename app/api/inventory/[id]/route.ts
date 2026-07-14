import { productSchema } from "@/app/inventory/lib/validation";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requirePermission } from "@/lib/rbac/api-guard";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, response } = await requirePermission(request, 'inventory:update');
    if (!authorized) return response;
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = productSchema.partial().parse(body);
        const product = await prisma.product.update({
            where: { id },
            data: validatedData,
        });
        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error },
                { status: 400 }
            );
        }
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, response } = await requirePermission(request, 'inventory:delete');
    if (!authorized) return response;
    try {
        const { id } = await params;
        const product = await prisma.product.update({
            where: { id },
            data: { active: false },
        });
        return NextResponse.json({
            message: 'Product deactivated successfully',
            product,
        });
    } catch (error) {
        console.error('Error deactivating product:', error);
        return NextResponse.json(
            { error: 'Failed to deactivate product' },
            { status: 500 }
        );
    }
}