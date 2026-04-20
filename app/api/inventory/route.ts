import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/app/inventory/lib/validation";

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

    } catch (error) {

    }
}