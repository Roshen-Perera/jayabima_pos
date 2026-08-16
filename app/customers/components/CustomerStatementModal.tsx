"use client";

import React, { useMemo, useState } from "react";
import { alert } from "@/lib/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Loader2,
  Mail,
  Printer,
  Receipt,
  Search,
} from "lucide-react";
import { Customer } from "../types/customer.types";
import { CustomerPayment } from "../types/customerPayment.types";

interface CustomerStatementModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | any | null;
  sales?: any[];
  payments?: CustomerPayment[] | any[];
}

export type LedgerEntry = {
  id: string;
  date: Date;
  dateStr: string;
  type: "INVOICE" | "PAYMENT";
  ref: string;
  description: string;
  debit: number;   // Invoiced (+)
  credit: number;  // Paid (-)
  runningBalance: number;
};

export default function CustomerStatementModal({
  open,
  onClose,
  customer,
  sales = [],
  payments = [],
}: CustomerStatementModalProps) {
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

  const handleEmailStatement = async () => {
    if (!customer) return;

    if (!customer.email) {
      alert.error(
        "No Email Configured",
        `Customer "${customer.name}" does not have an email address configured.`
      );
      return;
    }

    try {
      setSendingEmail(true);
      const res = await fetch(`/api/customers/${customer.id}/email-statement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filteredEntries,
          totalBilled,
          totalPaid,
          netOutstanding,
          dateFilter,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send email statement.");
      }

      alert.success(
        "Statement Emailed!",
        `Official account statement successfully sent to ${customer.email}.`
      );
    } catch (err: any) {
      alert.error("Email Sending Failed", err.message || "Could not send statement email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrint = () => {
    if (!customer) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const rowsHtml = filteredEntries.map((entry) => `
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
          ${entry.debit > 0 ? "LKR " + entry.debit.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"}
        </td>
        <td style="text-align: right; font-weight: 600; color: #047857;">
          ${entry.credit > 0 ? "LKR " + entry.credit.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"}
        </td>
        <td style="text-align: right; font-weight: 700;">
          LKR ${entry.runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    `).join("");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Account Statement - ${customer.name}</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 11px; background: #ffffff; }
            .header-table { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 15px; }
            .header-table td { vertical-align: top; }
            .store-name { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin: 0 0 4px 0; }
            .store-sub { font-size: 10px; color: #64748b; margin: 2px 0; }
            .doc-title { text-align: right; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #2563eb; letter-spacing: 0.5px; }
            .doc-meta { text-align: right; font-size: 10px; color: #64748b; margin-top: 4px; }
            
            .info-card { width: 100%; margin-bottom: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
            .info-card td { vertical-align: top; }
            .cust-name { font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
            .cust-detail { font-size: 10px; color: #475569; margin: 2px 0; }

            .stat-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; text-align: center; }
            .stat-label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .stat-val { font-size: 11px; font-weight: bold; margin-top: 2px; }

            .ledger-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .ledger-table th { background: #f1f5f9; color: #334155; font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 8px 10px; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; text-align: left; }
            .ledger-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; vertical-align: top; }
            .ledger-table tr:nth-child(even) { background-color: #fafafa; }
            .ledger-table tr { page-break-inside: avoid; break-inside: avoid; }
            .ledger-table thead { display: table-header-group; }
            
            .badge-debit { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-weight: 600; }
            .badge-credit { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-weight: 600; }

            .footer-table { width: 100%; margin-top: 20px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 10px; color: #64748b; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <img src="/dwd.png" style="height: 48px; width: auto; object-fit: contain; margin-bottom: 4px;" alt="Logo" />
                <div class="store-sub">No 28/D, Rathnapura Road, Diurumpitiya, Getaheththa</div>
                <div class="store-sub">Tel: 0777187729 / 0362231535</div>
              </td>
              <td style="text-align: right;">
                <div class="doc-title">OFFICIAL STATEMENT OF ACCOUNT</div>
                <div class="doc-meta">Date Generated: ${statementDateStr}</div>
                <div class="doc-meta" style="font-family: monospace;">Ref: STMT-${customer.id?.slice(-6)?.toUpperCase() || "CUST"}</div>
              </td>
            </tr>
          </table>

          <table class="info-card">
            <tr>
              <td style="width: 55%;">
                <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Statement For Customer</div>
                <div class="cust-name">${customer.name}</div>
                ${customer.phone ? `<div class="cust-detail">Phone: ${customer.phone}</div>` : ""}
                ${customer.email ? `<div class="cust-detail">Email: ${customer.email}</div>` : ""}
                ${customer.address ? `<div class="cust-detail">Address: ${customer.address}</div>` : ""}
              </td>
              <td style="width: 45%;">
                <table style="width: 100%; border-collapse: separate; border-spacing: 4px;">
                  <tr>
                    <td class="stat-box">
                      <div class="stat-label">Total Billed</div>
                      <div class="stat-val" style="color: #0f172a;">LKR ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td class="stat-box">
                      <div class="stat-label">Total Paid</div>
                      <div class="stat-val" style="color: #047857;">LKR ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td class="stat-box">
                      <div class="stat-label">Net Owed</div>
                      <div class="stat-val" style="color: ${netOutstanding > 0 ? "#dc2626" : "#047857"};">LKR ${netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table class="ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ref #</th>
                <th>Type</th>
                <th>Description</th>
                <th style="text-align: right;">Debit (+ Billed)</th>
                <th style="text-align: right;">Credit (- Paid)</th>
                <th style="text-align: right;">Running Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 20px; color: #64748b; font-style: italic;">
                    No transaction ledger history recorded for the selected period.
                  </td>
                </tr>
              ` : rowsHtml}
            </tbody>
          </table>

          <table class="footer-table">
            <tr>
              <td>Please review your account statement. If you have questions regarding any transaction, please contact us.</td>
              <td style="text-align: right; font-weight: bold; color: #0f172a;">
                Current Outstanding Balance: LKR ${netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </table>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);
  };

  // Build and compute chronological ledger entries with running balance
  const ledgerEntries = useMemo(() => {
    if (!customer) return [];

    const entries: Omit<LedgerEntry, "runningBalance">[] = [];

    // 1. Map Sales (Invoices)
    sales.forEach((sale: any) => {
      const isCreditSale = sale.paymentType === "CREDIT" || sale.isCredit || Number(sale.creditAmount || 0) > 0;
      const amount = isCreditSale ? Number(sale.creditAmount || sale.totalAmount || sale.total || 0) : Number(sale.totalAmount || sale.total || 0);

      const itemsSummary = Array.isArray(sale.items) && sale.items.length > 0
        ? sale.items.map((i: any) => `${i.productName || i.product?.name || "Item"} (${i.quantity}x)`).join(", ")
        : "Sales Invoice";

      entries.push({
        id: `sale-${sale.id}`,
        date: new Date(sale.createdAt || sale.date || Date.now()),
        dateStr: new Date(sale.createdAt || sale.date || Date.now()).toLocaleDateString("en-LK"),
        type: "INVOICE",
        ref: sale.invoiceNo || sale.receiptNo || `INV-${sale.id.slice(-6).toUpperCase()}`,
        description: `${isCreditSale ? "[Credit Invoice]" : "[Invoice]"} ${itemsSummary}`,
        debit: amount,
        credit: 0,
      });
    });

    // 2. Map Payments
    payments.forEach((pay: any) => {
      const payMethodLabel = pay.method ? pay.method.replace("_", " ") : "Payment";
      const refStr = pay.reference ? ` (${pay.reference})` : "";
      
      entries.push({
        id: `pay-${pay.id}`,
        date: new Date(pay.paidAt || pay.createdAt || Date.now()),
        dateStr: new Date(pay.paidAt || pay.createdAt || Date.now()).toLocaleDateString("en-LK"),
        type: "PAYMENT",
        ref: `PAY-${pay.id.slice(-6).toUpperCase()}`,
        description: `Payment Received [${payMethodLabel}]${refStr}${pay.note ? ` - ${pay.note}` : ""}`,
        debit: 0,
        credit: Number(pay.amount || 0),
      });
    });

    // 3. Sort Chronologically (Ascending: Oldest to Newest)
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 4. Calculate Running Balance line-by-line
    let currentBal = 0;
    const finalEntries: LedgerEntry[] = entries.map((entry) => {
      currentBal += entry.debit - entry.credit;
      return {
        ...entry,
        runningBalance: currentBal,
      };
    });

    return finalEntries;
  }, [customer, sales, payments]);

  // Apply Date Filtering
  const filteredEntries = useMemo(() => {
    if (dateFilter === "all") return ledgerEntries;

    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (dateFilter === "30days") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 30);
    } else if (dateFilter === "thisMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateFilter === "custom") {
      if (customStartDate) startDate = new Date(customStartDate);
      if (customEndDate) {
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    return ledgerEntries.filter((entry) => {
      if (startDate && entry.date < startDate) return false;
      if (endDate && entry.date > endDate) return false;
      return true;
    });
  }, [ledgerEntries, dateFilter, customStartDate, customEndDate]);

  // Compute Totals
  const totalBilled = useMemo(
    () => filteredEntries.reduce((sum, e) => sum + e.debit, 0),
    [filteredEntries]
  );
  const totalPaid = useMemo(
    () => filteredEntries.reduce((sum, e) => sum + e.credit, 0),
    [filteredEntries]
  );
  const netOutstanding = Number(customer?.creditBalance ?? (totalBilled - totalPaid));

  if (!customer) return null;

  const statementDateStr = new Date().toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-4xl max-h-[92vh] flex flex-col print:max-h-none print:w-full print:p-0 print:border-none print:shadow-none"
        data-theme="light"
      >
        <DialogHeader className="print:hidden border-b pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              Customer Account Statement &amp; Ledger
            </DialogTitle>

            {/* Print, Email & Action Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailStatement}
                disabled={sendingEmail}
                className="gap-1.5 text-xs text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
              >
                {sendingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
                Email Statement
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
                <Printer className="h-4 w-4" />
                Print Statement
              </Button>
              <Button variant="default" size="sm" onClick={onClose} className="text-xs">
                Close
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" /> Date Filter:
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All-Time History</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === "custom" && (
              <div className="flex items-center gap-2 text-xs">
                <Input
                  type="date"
                  className="h-8 text-xs w-32"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span>to</span>
                <Input
                  type="date"
                  className="h-8 text-xs w-32"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Statement Printable Body */}
        <div
          className="space-y-4 text-xs overflow-y-auto flex-1 p-2 print:overflow-visible print:p-4"
          id="customer-statement-printable"
        >
          {/* Company Branding & Header */}
          <div className="border-b pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/dwd.png" alt="Jayabima Hardware Logo" className="h-12 w-auto object-contain" />
                <div>
                  <h1 className="text-base font-bold tracking-tight uppercase text-foreground">
                    JAYABIMA HARDWARE &amp; STORES
                  </h1>
                  <p className="text-[11px] text-muted-foreground">
                    No 28/D, Rathnapura Road, Diurumpitiya, Getaheththa
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Tel: 0777187729 / 0362231535
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right w-full sm:w-auto">
                <Badge variant="outline" className="text-xs font-bold bg-primary/10 text-primary border-primary/20 mb-1">
                  OFFICIAL STATEMENT OF ACCOUNT
                </Badge>
                <p className="text-[11px] text-muted-foreground">Date Generated: {statementDateStr}</p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Ref: STMT-{customer.id?.slice(-6)?.toUpperCase() || "CUST"}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Metadata & Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border">
            <div>
              <p className="text-[11px] uppercase font-bold text-muted-foreground mb-1">Statement For Customer</p>
              <h2 className="text-sm font-bold text-foreground">{customer.name}</h2>
              {customer.phone && <p className="text-xs text-muted-foreground">Phone: {customer.phone}</p>}
              {customer.email && <p className="text-xs text-muted-foreground">Email: {customer.email}</p>}
              {customer.address && <p className="text-xs text-muted-foreground">Address: {customer.address}</p>}
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-3 gap-2 text-center sm:text-right">
              <div className="p-2 bg-background rounded border">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Total Billed</p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  LKR {totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-background rounded border">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Total Paid</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  LKR {totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-background rounded border">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Net Owed</p>
                <p
                  className={`text-xs font-bold mt-0.5 ${
                    netOutstanding > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600"
                  }`}
                >
                  LKR {netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Ledger Transactions Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted text-[11px] uppercase font-semibold text-muted-foreground border-b">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Ref #</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5 max-w-[190px]">Description</th>
                  <th className="p-2.5 text-right">Debit (+ Billed)</th>
                  <th className="p-2.5 text-right">Credit (- Paid)</th>
                  <th className="p-2.5 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground italic">
                      No transaction ledger history recorded for the selected period.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-medium whitespace-nowrap">{entry.dateStr}</td>
                      <td className="p-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {entry.ref}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        {entry.type === "INVOICE" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] gap-0.5">
                            <ArrowUpRight className="w-3 h-3 text-blue-600" /> Invoice
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] gap-0.5">
                            <ArrowDownRight className="w-3 h-3 text-emerald-600" /> Payment
                          </Badge>
                        )}
                      </td>
                      <td className="p-2.5 text-muted-foreground max-w-[190px] truncate" title={entry.description}>
                        {entry.description}
                      </td>
                      <td className="p-2.5 text-right font-medium whitespace-nowrap">
                        {entry.debit > 0 ? (
                          `LKR ${entry.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-muted-foreground/40">-</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {entry.credit > 0 ? (
                          `LKR ${entry.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-muted-foreground/40">-</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-bold whitespace-nowrap">
                        LKR {entry.runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Statement Footer / Terms */}
          <div className="border-t pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-muted-foreground gap-2">
            <p>
              Please review your account statement. If you have questions regarding any transaction, please contact us.
            </p>
            <div className="font-semibold text-foreground">
              Current Outstanding Balance: LKR {netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
