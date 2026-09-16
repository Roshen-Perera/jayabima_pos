import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/api-guard";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { authorized, response } = await requirePermission(request, "inventory:view");
    if (!authorized) return response;

    try {
        const { id } = await params;

        const batches = await prisma.stockBatch.findMany({
            where: { productId: id },
            include: {
                purchaseOrder: {
                    select: {
                        id: true,
                        orderNumber: true,
                        receivedAt: true,
                        supplier: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(batches);
    } catch (error) {
        console.error("Error fetching stock batches:", error);
        return NextResponse.json(
            { error: "Failed to fetch stock batches" },
            { status: 500 }
        );
    }
}
