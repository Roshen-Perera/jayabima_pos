import { NextRequest } from "next/server";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try{
        const { id } = await params;
        const body = await request.json();

    } catch (error) {

    }
}