import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/api-guard";
import { sendCustomerStatementEmail } from "@/lib/email";
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

    if (!customer.email) {
      return NextResponse.json(
        { error: `Customer "${customer.name}" does not have an email address configured.` },
        { status: 400 }
      );
    }

    const statementDateStr = new Date().toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const ref = `STMT-${customer.id.slice(-6).toUpperCase()}`;

    // 1. Generate Official Vector A4 PDF Attachment Buffer
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

    // 2. Dispatch Official Bank-Style Notification Email with PDF Attachment
    const emailResult = await sendCustomerStatementEmail({
      email: customer.email,
      name: customer.name,
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
      message: `Statement successfully emailed to ${customer.email}`,
    });
  } catch (error) {
    console.error("Error sending statement email:", error);
    return NextResponse.json(
      { error: "Failed to process email statement request" },
      { status: 500 }
    );
  }
}
