import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/app/inventory/lib/validation";
import { z } from "zod";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const showInactive = searchParams.get('showInactive') === 'true';
        const products = await prisma.product.findMany({
            where: { active: !showInactive, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        return new Response(JSON.stringify(products), { status: 200 });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = productSchema.parse(body);
        const product = await prisma.product.create({
            data: {
                name: validatedData.name,
                category: validatedData.category,
                sku: validatedData.sku,
                price: validatedData.price,
                cost: validatedData.cost,
                stock: validatedData.stock || 0,
                minStock: validatedData.minStock || 0,
                description: validatedData.description || null,
                image: validatedData.image || null,
                active: true,
            },
        });
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error },
                { status: 400 }
            );
        }
    }
}