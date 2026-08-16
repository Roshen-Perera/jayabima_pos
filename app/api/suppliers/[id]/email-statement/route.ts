import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/api-guard";
import { sendSupplierStatementEmail } from "@/lib/email";
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

    if (!supplier.email) {
      return NextResponse.json(
        { error: `Supplier "${supplier.name}" does not have an email address configured.` },
        { status: 400 }
      );
    }

    const statementDateStr = new Date().toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const ref = `SUP-STMT-${supplier.id.slice(-6).toUpperCase()}`;

    // 1. Generate Vector A4 PDF Attachment Buffer
    const pdfBuffer = await generateSupplierStatementPDF({
      supplier: {
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        contactPerson: supplier.contactPerson,
      },
      statementDateStr,
      ref,
      totalBilled: Number(totalBilled),
      totalPaid: Number(totalPaid),
      netOutstanding: Number(netOutstanding),
      entries: filteredEntries,
    });

    // 2. Send Supplier Statement Email
    const emailResult = await sendSupplierStatementEmail({
      email: supplier.email,
      name: supplier.name,
      statementDateStr,
      ref,
      totalBilled: Number(totalBilled),
      totalPaid: Number(totalPaid),
      netOutstanding: Number(netOutstanding),
      pdfBuffer,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send email statement. Please check SMTP email settings." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Accounts Payable statement successfully emailed to ${supplier.email}`,
    });
  } catch (error) {
    console.error("Error sending supplier statement email:", error);
    return NextResponse.json(
      { error: "Failed to process supplier statement email request" },
      { status: 500 }
    );
  }
}
