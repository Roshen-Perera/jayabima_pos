import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {

    }
}