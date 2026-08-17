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
  Download,
  FileSpreadsheet,
  Loader2,
  Mail,
  Printer,
  Receipt,
  Search,
} from "lucide-react";
import { Supplier } from "../types/supplier.types";
import { SupplierPayment } from "../types/supplierPayment.types";
import { PurchaseOrder } from "../types/purchaseOrder.types";

interface SupplierStatementModalProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | any | null;
  orders?: PurchaseOrder[] | any[];
  payments?: SupplierPayment[] | any[];
}

export type SupplierLedgerEntry = {
  id: string;
  date: Date;
  dateStr: string;
  type: "PURCHASE" | "PAYMENT";
  ref: string;
  description: string;
  debit: number;   // Paid (-)
  credit: number;  // Billed (+)
  runningBalance: number;
};

export default function SupplierStatementModal({
  open,
  onClose,
  supplier,
  orders = [],
  payments = [],
}: SupplierStatementModalProps) {
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    if (!supplier) return;

    try {
      setDownloadingPdf(true);
      const res = await fetch(`/api/suppliers/${supplier.id}/pdf-statement`, {
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

      if (!res.ok) {
        throw new Error("Failed to generate PDF download.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Statement_STMT-SUP-${supplier.id?.slice(-6)?.toUpperCase() || "SUP"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      alert.success(
        "PDF Downloaded!",
        `Statement_STMT-SUP-${supplier.id?.slice(-6)?.toUpperCase() || "SUP"}.pdf has been saved to your downloads.`
      );
    } catch (err: any) {
      alert.error("Download Failed", err.message || "Could not download PDF statement.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleEmailStatement = async () => {
    if (!supplier) return;

    if (!supplier.email) {
      alert.error(
        "No Email Configured",
        `Supplier "${supplier.name}" does not have an email address configured.`
      );
      return;
    }

    try {
      setSendingEmail(true);
      const res = await fetch(`/api/suppliers/${supplier.id}/email-statement`, {
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

      alert.success("Statement Emailed!", data.message || `Sent to ${supplier.email}`);
    } catch (err: any) {
      alert.error("Email Delivery Failed", err.message || "Could not email statement.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrintStatement = () => {
    if (!supplier) return;

    const todayStr = new Date().toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.top = "-1000px";
    printWindow.style.left = "-1000px";
    document.body.appendChild(printWindow);

    const doc = printWindow.contentDocument || printWindow.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Supplier Statement - ${supplier.name}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 0; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
            .store-name { font-size: 18px; font-weight: bold; color: #0f172a; }
            .doc-title { font-size: 14px; font-weight: bold; color: #1d4ed8; text-align: right; }
            .info-section { width: 100%; margin-bottom: 16px; border-collapse: collapse; }
            .info-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 8px 12px; border-radius: 6px; }
            .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            .summary-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; background: #f8fafc; }
            .summary-card .title { font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .summary-card .value { font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 2px; }
            .ledger-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .ledger-table th { background: #0f172a; color: white; padding: 6px 8px; font-size: 9px; text-align: left; text-transform: uppercase; }
            .ledger-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
            .ledger-table tr:nth-child(even) { background-color: #f8fafc; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .badge-po { color: #1d4ed8; font-weight: bold; }
            .badge-pay { color: #047857; font-weight: bold; }
            .footer { margin-top: 24px; border-top: 1px solid #cbd5e1; pt: 8px; text-align: center; font-size: 9px; color: #64748b; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <img src="/favicon.png" style="height: 36px; width: 36px; object-fit: contain;" alt="Logo" />
                  <div class="store-name">JAYABIMA HARDWARE & STORES</div>
                </div>
                <div style="font-size: 10px; color: #64748b;">No 28/D, Rathnapura Road, Diurumpitiya, Getaheththa</div>
                <div style="font-size: 10px; color: #64748b;">Tel: 0777187729 / 0362231535</div>
              </td>
              <td class="doc-title" valign="top">
                SUPPLIER STATEMENT OF ACCOUNT
                <div style="font-size: 10px; font-weight: normal; color: #475569; margin-top: 4px;">Date: ${todayStr}</div>
                <div style="font-size: 10px; font-weight: normal; color: #475569;">Ref: STMT-SUP-${supplier.id?.slice(-6)?.toUpperCase()}</div>
              </td>
            </tr>
          </table>

          <table class="info-section">
            <tr>
              <td width="50%" valign="top">
                <div class="info-box">
                  <strong>Supplier Details:</strong><br/>
                  <span style="font-size: 12px; font-weight: bold;">${supplier.name}</span><br/>
                  ${supplier.contactPerson ? `Contact: ${supplier.contactPerson}<br/>` : ''}
                  ${supplier.phone ? `Phone: ${supplier.phone}<br/>` : ''}
                  ${supplier.email ? `Email: ${supplier.email}<br/>` : ''}
                  ${supplier.address ? `Address: ${supplier.address}` : ''}
                </div>
              </td>
              <td width="4%"></td>
              <td width="46%" valign="top">
                <div class="info-box">
                  <strong>Bank / Payment Details:</strong><br/>
                  Bank: ${supplier.bankName || 'N/A'}<br/>
                  Account: ${supplier.accountNumber || 'N/A'}<br/>
                  Statement Period: ${dateFilter === 'all' ? 'All Transactions' : dateFilter.toUpperCase()}
                </div>
              </td>
            </tr>
          </table>

          <table class="summary-table">
            <tr>
              <td width="32%">
                <div class="summary-card">
                  <div class="title">Total Billed</div>
                  <div class="value">LKR ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                </div>
              </td>
              <td width="2%"></td>
              <td width="32%">
                <div class="summary-card">
                  <div class="title">Total Paid</div>
                  <div class="value" style="color: #047857;">LKR ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                </div>
              </td>
              <td width="2%"></td>
              <td width="32%">
                <div class="summary-card">
                  <div class="title">Net Payable</div>
                  <div class="value" style="color: ${netOutstanding > 0 ? '#dc2626' : '#047857'};">LKR ${netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                </div>
              </td>
            </tr>
          </table>

          <table class="ledger-table">
            <thead>
              <tr>
                <th width="12%">Date</th>
                <th width="20%">Ref #</th>
                <th width="10%">Type</th>
                <th width="28%">Description</th>
                <th width="15%" class="text-right">Billed (+)</th>
                <th width="15%" class="text-right">Paid (-)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(e => `
                <tr>
                  <td>${e.dateStr}</td>
                  <td>${e.ref}</td>
                  <td class="${e.type === 'PURCHASE' ? 'badge-po' : 'badge-pay'}">${e.type === 'PURCHASE' ? 'PO' : 'PAY'}</td>
                  <td>${e.description}</td>
                  <td class="text-right">${e.credit > 0 ? 'LKR ' + e.credit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
                  <td class="text-right" style="color: #047857; font-weight: bold;">${e.debit > 0 ? 'LKR ' + e.debit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Official Computer-Generated Supplier Account Statement - Jayabima Hardware & Stores
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printWindow.contentWindow?.focus();
      printWindow.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printWindow)) {
          document.body.removeChild(printWindow);
        }
      }, 1000);
    }, 500);
  };

  // Compile raw ledger entries
  const rawLedgerEntries = useMemo(() => {
    const entries: {
      id: string;
      date: Date;
      type: "PURCHASE" | "PAYMENT";
      ref: string;
      description: string;
      debit: number;
      credit: number;
    }[] = [];

    // 1. Add Purchase Orders (Billed -> Credit)
    orders.forEach((po: any) => {
      const amount = Number(po.totalAmount || 0);
      entries.push({
        id: `po-${po.id}`,
        date: new Date(po.createdAt || po.orderDate || Date.now()),
        type: "PURCHASE",
        ref: po.orderNumber || `PO-${po.id.slice(-6).toUpperCase()}`,
        description: `Purchase Order (${po.status || "COMPLETED"})`,
        debit: 0,
        credit: amount,
      });
    });

    // 2. Add Supplier Payments (Paid -> Debit)
    payments.forEach((pay: any) => {
      const amount = Number(pay.amount || 0);
      entries.push({
        id: `pay-${pay.id}`,
        date: new Date(pay.paidAt || pay.createdAt || Date.now()),
        type: "PAYMENT",
        ref: pay.reference || `PAY-${pay.id.slice(-6).toUpperCase()}`,
        description: `Payment via ${pay.method}${pay.reference ? ` (${pay.reference})` : ""}`,
        debit: amount,
        credit: 0,
      });
    });

    // Sort ascending by date
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Compute running balance
    let currentBal = 0;
    return entries.map((entry) => {
      currentBal = currentBal + entry.credit - entry.debit;
      return {
        ...entry,
        dateStr: entry.date.toLocaleDateString("en-LK", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        runningBalance: currentBal,
      };
    });
  }, [orders, payments]);

  // Filter entries by Date Range
  const filteredEntries = useMemo(() => {
    const now = new Date();
    return rawLedgerEntries.filter((entry) => {
      const eDate = entry.date;
      if (dateFilter === "today") {
        return eDate.toDateString() === now.toDateString();
      }
      if (dateFilter === "7days") {
        const past7 = new Date(now);
        past7.setDate(now.getDate() - 7);
        return eDate >= past7;
      }
      if (dateFilter === "thisMonth") {
        return (
          eDate.getMonth() === now.getMonth() &&
          eDate.getFullYear() === now.getFullYear()
        );
      }
      if (dateFilter === "custom") {
        if (customStartDate && new Date(customStartDate) > eDate) return false;
        if (customEndDate) {
          const endD = new Date(customEndDate);
          endD.setHours(23, 59, 59, 999);
          if (eDate > endD) return false;
        }
      }
      return true;
    });
  }, [rawLedgerEntries, dateFilter, customStartDate, customEndDate]);

  // Summary Metrics
  const totalBilled = useMemo(
    () => filteredEntries.reduce((acc, curr) => acc + curr.credit, 0),
    [filteredEntries]
  );
  const totalPaid = useMemo(
    () => filteredEntries.reduce((acc, curr) => acc + curr.debit, 0),
    [filteredEntries]
  );
  const netOutstanding = Number(supplier?.payableBalance ?? (totalBilled - totalPaid));

  if (!supplier) return null;

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
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Supplier Account Statement &amp; Ledger
            </DialogTitle>

            {/* Actions Controls */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="gap-1.5 text-xs text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-medium"
              >
                {downloadingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                ) : (
                  <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                Download PDF
              </Button>

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

              <Button variant="outline" size="sm" onClick={handlePrintStatement} className="gap-1.5 text-xs">
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
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
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
          id="supplier-statement-printable"
        >
          {/* Company Branding & Header */}
          <div className="border-b pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/favicon.png" alt="Jayabima Hardware Icon" className="h-10 w-10 object-contain shrink-0" />
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
                <Badge variant="outline" className="text-xs font-bold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 mb-1">
                  SUPPLIER STATEMENT OF ACCOUNT
                </Badge>
                <p className="text-[11px] text-muted-foreground">Date Generated: {statementDateStr}</p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Ref: STMT-SUP-{supplier.id?.slice(-6)?.toUpperCase() || "SUP"}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier Metadata & Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 sm:p-4.5 rounded-lg border">
            <div>
              <p className="text-[11px] uppercase font-bold text-muted-foreground mb-1">Supplier Details</p>
              <h2 className="text-sm font-bold text-foreground">{supplier.name}</h2>
              {supplier.contactPerson && <p className="text-xs text-muted-foreground">Contact Person: {supplier.contactPerson}</p>}
              {supplier.phone && <p className="text-xs text-muted-foreground">Phone: {supplier.phone}</p>}
              {supplier.email && <p className="text-xs text-muted-foreground">Email: {supplier.email}</p>}
              {supplier.address && <p className="text-xs text-muted-foreground">Address: {supplier.address}</p>}
              {(supplier.bankName || supplier.accountNumber) && (
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Bank: {supplier.bankName || "N/A"} ({supplier.accountNumber || "No Acc"})
                </p>
              )}
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
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Net Payable</p>
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
                  <th className="p-2.5 min-w-[150px]">Ref #</th>
                  <th className="p-2.5 min-w-[110px]">Type</th>
                  <th className="p-2.5 max-w-[190px]">Description</th>
                  <th className="p-2.5 text-right">Billed (+)</th>
                  <th className="p-2.5 text-right">Paid (-)</th>
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
                      <td className="p-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap min-w-[150px] pr-4">
                        {entry.ref}
                      </td>
                      <td className="p-2.5 whitespace-nowrap min-w-[110px]">
                        {entry.type === "PURCHASE" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] gap-0.5">
                            <ArrowUpRight className="w-3 h-3 text-blue-600" /> PURCHASE
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] gap-0.5">
                            <ArrowDownRight className="w-3 h-3 text-emerald-600" /> PAYMENT
                          </Badge>
                        )}
                      </td>
                      <td className="p-2.5 text-muted-foreground max-w-[190px] truncate" title={entry.description}>
                        {entry.description}
                      </td>
                      <td className="p-2.5 text-right font-medium whitespace-nowrap">
                        {entry.credit > 0 ? (
                          `LKR ${entry.credit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        ) : (
                          <span className="text-muted-foreground/40">-</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {entry.debit > 0 ? (
                          `LKR ${entry.debit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
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
              Please review this supplier statement of account. If you have questions regarding any transaction, please contact us.
            </p>
            <div className="font-semibold text-foreground">
              Net Balance Payable: LKR {netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
