import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/api-guard";
import { sendCustomerStatementEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, response } = await requirePermission(request, "customers:view");
  if (!authorized) return response;

  try {
    const customerId = params.id;
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

    const rowsHtml = filteredEntries.map((entry: any) => `
      <tr>
        <td style="white-space: nowrap; font-weight: 500;">${entry.dateStr}</td>
        <td style="font-family: monospace; font-size: 10px; color: #475569;">${entry.ref}</td>
        <td>
          <span class="${entry.type === "INVOICE" ? "badge-debit" : "badge-credit"}">
            ${entry.type === "INVOICE" ? "Invoice" : "Payment"}
          </span>
        </td>
        <td style="color: #334155;">${entry.description}</td>
        <td style="text-align: right; font-weight: 500;">
          ${entry.debit > 0 ? "LKR " + Number(entry.debit).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"}
        </td>
        <td style="text-align: right; font-weight: 600; color: #047857;">
          ${entry.credit > 0 ? "LKR " + Number(entry.credit).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"}
        </td>
        <td style="text-align: right; font-weight: 700;">
          LKR ${Number(entry.runningBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    `).join("");

    const emailResult = await sendCustomerStatementEmail({
      email: customer.email,
      name: customer.name,
      statementDateStr,
      ref: `STMT-${customer.id.slice(-6).toUpperCase()}`,
      totalBilled: Number(totalBilled),
      totalPaid: Number(totalPaid),
      netOutstanding: Number(netOutstanding),
      rowsHtml,
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
