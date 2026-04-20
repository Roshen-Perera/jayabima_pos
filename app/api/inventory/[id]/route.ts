import { productSchema } from "@/app/inventory/lib/validation";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = productSchema.partial().parse(body);
        const product = await prisma.product.update({
            where: { id },
            data: validatedData,
        });
    } catch (error) {

    }
}