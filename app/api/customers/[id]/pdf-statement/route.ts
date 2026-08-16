import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/api-guard";
import { generateCustomerStatementPDF } from "@/lib/pdf-statement";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { authorized, response } = await requirePermission(request, "customers:view");
  if (!authorized) return response;

  try {
    const resolvedParams = await params;
    const customerId = resolvedParams.id;
    const body = await request.json().catch(() => ({}));
    const { filteredEntries = [], totalBilled = 0, totalPaid = 0, netOutstanding = 0 } = body;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const statementDateStr = new Date().toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const ref = `STMT-${customer.id.slice(-6).toUpperCase()}`;

    const pdfBuffer = await generateCustomerStatementPDF({
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      },
      statementDateStr,
      ref,
      totalBilled: Number(totalBilled),
      totalPaid: Number(totalPaid),
      netOutstanding: Number(netOutstanding),
      entries: filteredEntries,
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Statement_${ref}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF statement download:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF statement" },
      { status: 500 }
    );
  }
}
