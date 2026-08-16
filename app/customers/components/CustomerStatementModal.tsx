"use client";

import React, { useMemo, useState } from "react";
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

  const handlePrint = () => {
    window.print();
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
        {/* Print Styles for Multi-page A4 Statements */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 15mm 15mm;
            }
            body {
              background: white !important;
              color: black !important;
            }
            body > *:not([role="dialog"]),
            [data-radix-portal] > div:first-child {
              display: none !important;
            }
            [role="dialog"] {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: 100% !important;
              max-height: none !important;
              transform: none !important;
              overflow: visible !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            thead {
              display: table-header-group !important;
            }
          }
        `}</style>

        <DialogHeader className="print:hidden border-b pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              Customer Account Statement &amp; Ledger
            </DialogTitle>

            {/* Print & Action Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="h-4 w-4" />
                Print Statement
              </Button>
              <Button variant="default" size="sm" onClick={onClose}>
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
                  <th className="p-2.5">Description</th>
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
                      <td className="p-2.5 text-muted-foreground max-w-xs truncate" title={entry.description}>
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
