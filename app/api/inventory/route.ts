import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const showInactive = searchParams.get('showInactive') === 'true';
    } catch (error) {

    }
}