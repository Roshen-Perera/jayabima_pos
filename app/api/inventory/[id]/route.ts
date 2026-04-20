import { productSchema } from "@/app/inventory/lib/validation";
import { NextRequest } from "next/server";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try{
        const { id } = await params;
        const body = await request.json();
        const validatedData = productSchema.partial().parse(body);
    } catch (error) {

    }
}