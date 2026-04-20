import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const showInactive = searchParams.get('showInactive') === 'true';
        const products = await prisma.product.findMany({
            where: { active: !showInactive, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {

    }
}