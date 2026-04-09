import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    
}