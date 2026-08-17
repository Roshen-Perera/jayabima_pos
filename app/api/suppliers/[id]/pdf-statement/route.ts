import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/api-guard";
import { generateSupplierStatementPDF } from "@/lib/pdf-supplier-statement";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const { authorized, response } = await requirePermission(request, "suppliers:view");
  if (!authorized) return response;

  try {
    const resolvedParams = await params;
    const supplierId = resolvedParams.id;
    const body = await request.json().catch(() => ({}));
    const { filteredEntries = [], totalBilled = 0, totalPaid = 0, netOutstanding = 0 } = body;

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    const statementDateStr = new Date().toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const ref = `STMT-SUP-${supplier.id.slice(-6).toUpperCase()}`;

    const pdfBuffer = await generateSupplierStatementPDF({
      supplier: {
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        bankName: supplier.bankName,
        accountNumber: supplier.accountNumber,
      },
      statementDateStr,
      ref,
      totalBilled: Number(totalBilled),
      totalPaid: Number(totalPaid),
      netOutstanding: Number(netOutstanding),
      entries: filteredEntries,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Supplier_Statement_${ref}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating supplier PDF statement download:", error);
    return NextResponse.json(
      { error: "Failed to generate supplier PDF statement" },
      { status: 500 }
    );
  }
}
