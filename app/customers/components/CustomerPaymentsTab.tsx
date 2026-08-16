"use client";

import React, { useEffect, useState } from "react";
import { alert } from "@/lib/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Banknote,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  FileCheck2,
  FileSpreadsheet,
  Loader2,
  Plus,
  Printer,
  Receipt,
  UserCheck,
  Users,
} from "lucide-react";
import { CustomerPayment, CustomerPaymentMethod } from "../types/customerPayment.types";
import CustomerPaymentReceiptModal from "./CustomerPaymentReceiptModal";
import CustomerStatementModal from "./CustomerStatementModal";

export const CustomerPaymentsTab = () => {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<CustomerPayment | null>(null);

  // Statement modal state
  const [statementOpen, setStatementOpen] = useState(false);
  const [statementCustomer, setStatementCustomer] = useState<any | null>(null);
  const [statementSales, setStatementSales] = useState<any[]>([]);
  const [statementPayments, setStatementPayments] = useState<any[]>([]);

  const handleOpenStatement = async (cust: any) => {
    setStatementCustomer(cust);
    try {
      const [salesRes, payRes] = await Promise.all([
        fetch(`/api/sales?customerId=${cust.id}`),
        fetch(`/api/customer-payments?customerId=${cust.id}`),
      ]);
      if (salesRes.ok) setStatementSales(await salesRes.json());
      if (payRes.ok) setStatementPayments(await payRes.json());
    } catch (err) {
      console.error("Error fetching statement data:", err);
    }
    setStatementOpen(true);
  };

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>("all");

  const [statementOpen, setStatementOpen] = useState(false);
  const [customerSales, setCustomerSales] = useState<any[]>([]);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<CustomerPaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : data.customers || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchPayments = async (custId?: string) => {
    setLoading(true);
    try {
      const url =
        custId && custId !== "all"
          ? `/api/customer-payments?customerId=${custId}`
          : "/api/customer-payments";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Error fetching customer payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchPayments(selectedCustomerFilter);
  }, [selectedCustomerFilter]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert.error("Customer required", "Please select a customer.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert.error("Invalid amount", "Please enter a valid payment amount greater than 0.");
      return;
    }

    const selectedCust = customers.find((c) => c.id === customerId);
    const currentBalance = Number(selectedCust?.creditBalance || 0);

    if (currentBalance <= 0) {
      alert.error(
        "No Credit Owed",
        `Customer "${selectedCust?.name}" has no outstanding credit balance to settle.`
      );
      return;
    }

    if (numAmount > currentBalance) {
      alert.error(
        "Overpayment Exceeded",
        `Payment amount (LKR ${numAmount.toLocaleString()}) cannot exceed the customer's current balance of LKR ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`
      );
      return;
    }

    if (method === "CHEQUE") {
      if (!reference.trim()) {
        alert.error("Cheque Number Required", "Please enter the cheque number (e.g. CHQ-554411).");
        return;
      }
      if (!chequeDate) {
        alert.error("Cheque Date Required", "Please select the cheque realization date.");
        return;
      }
    }

    if (method === "BANK_TRANSFER" && !reference.trim()) {
      alert.error("Bank Reference Required", "Please enter the bank transfer reference or transaction ID.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customer-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          amount: numAmount,
          method,
          reference: reference.trim() || undefined,
          chequeDate: method === "CHEQUE" && chequeDate ? chequeDate : undefined,
          note: note.trim() || undefined,
          paidAt: paidAt ? new Date(paidAt).toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        const detailsMsg = err.details?.[0]?.message || err.error || "Failed to record payment";
        throw new Error(detailsMsg);
      }

      const createdPayment = await res.json();

      alert.success(
        "Payment Recorded!",
        `Successfully received payment of LKR ${numAmount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`
      );

      // Reset form
      setCustomerId("");
      setAmount("");
      setMethod("CASH");
      setReference("");
      setChequeDate("");
      setNote("");
      setPaidAt(new Date().toISOString().split("T")[0]);
      setCreateOpen(false);

      // Show receipt modal
      setSelectedPaymentForReceipt(createdPayment);
      setReceiptOpen(true);

      // Refresh data
      fetchPayments(selectedCustomerFilter);
      fetchCustomers();
    } catch (err: any) {
      console.error(err);
      alert.error("Error recording payment", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getMethodBadge = (m: CustomerPaymentMethod) => {
    switch (m) {
      case "CASH":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1">
            <Banknote className="w-3 h-3" /> Cash
          </Badge>
        );
      case "BANK_TRANSFER":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 gap-1">
            <CreditCard className="w-3 h-3" /> Bank Transfer
          </Badge>
        );
      case "CHEQUE":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 gap-1">
            <Receipt className="w-3 h-3" /> Cheque
          </Badge>
        );
      default:
        return <Badge variant="outline">{m}</Badge>;
    }
  };

  const selectedCustObj = customers.find((c) => c.id === customerId);

  return (
    <div className="space-y-4">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Customer Payments &amp; Accounts Receivable</h2>
          <p className="text-sm text-muted-foreground">
            Record payments received from customers (cash, bank transfers, cheques) to reduce credit balances.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Record Customer Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreatePayment}>
              <DialogHeader>
                <DialogTitle>Record Customer Payment</DialogTitle>
                <DialogDescription>
                  Enter payment details to reduce the credit balance (receivable) for a customer.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {/* Customer select */}
                <div className="grid gap-2">
                  <Label htmlFor="payCust">Customer *</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger id="payCust">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} (Credit Owed: LKR {Number(c.creditBalance || 0).toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show active balance indicator */}
                {selectedCustObj && (
                  <div className="p-3 bg-muted/60 rounded-md flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Current Credit Balance Owed:</span>
                    <span
                      className={`font-bold text-sm ${
                        Number(selectedCustObj.creditBalance) > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      LKR {Number(selectedCustObj.creditBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* Amount */}
                <div className="grid gap-2">
                  <Label htmlFor="payCustAmount">Payment Amount (LKR) *</Label>
                  <Input
                    id="payCustAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Payment Method */}
                <div className="grid gap-2">
                  <Label htmlFor="payCustMethod">Payment Method *</Label>
                  <Select
                    value={method}
                    onValueChange={(val) => setMethod(val as CustomerPaymentMethod)}
                  >
                    <SelectTrigger id="payCustMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference # */}
                {(method === "BANK_TRANSFER" || method === "CHEQUE") && (
                  <div className="grid gap-2">
                    <Label htmlFor="payCustRef">
                      {method === "CHEQUE" ? "Cheque Number *" : "Bank Transfer Ref / Txn ID"}
                    </Label>
                    <Input
                      id="payCustRef"
                      placeholder={method === "CHEQUE" ? "e.g. CHQ-554411" : "e.g. TRX-100299"}
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                )}

                {/* Cheque Date if Cheque */}
                {method === "CHEQUE" && (
                  <div className="grid gap-2">
                    <Label htmlFor="payCustChequeDate">Cheque Realization Date</Label>
                    <Input
                      id="payCustChequeDate"
                      type="date"
                      value={chequeDate}
                      onChange={(e) => setChequeDate(e.target.value)}
                    />
                  </div>
                )}

                {/* Payment Date */}
                <div className="grid gap-2">
                  <Label htmlFor="payCustDate">Date Received *</Label>
                  <Input
                    id="payCustDate"
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                </div>

                {/* Note */}
                <div className="grid gap-2">
                  <Label htmlFor="payCustNote">Notes / Remarks (Optional)</Label>
                  <Textarea
                    id="payCustNote"
                    placeholder="e.g. Settlement for cement credit invoice #1002..."
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Record Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Filter by Customer:</span>
          <select
            className="border rounded-md px-3 py-1 text-sm bg-background text-foreground"
            value={selectedCustomerFilter}
            onChange={(e) => setSelectedCustomerFilter(e.target.value)}
          >
            <option value="all">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Owed: LKR {Number(c.creditBalance || 0).toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {selectedCustomerFilter !== "all" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const cust = customers.find((c) => c.id === selectedCustomerFilter);
              if (cust) handleOpenStatement(cust);
            }}
            className="gap-1.5 text-xs border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            View Customer Statement
          </Button>
        )}
      </div>

      {/* Payments History List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading payment records...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customer payment records</h3>
          <p className="text-muted-foreground text-sm">
            Record payments received from customers to track settled accounts receivable, cash payments, and cheques.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-xs uppercase text-muted-foreground border-b font-medium">
                  <tr>
                    <th className="p-3">Date Received</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Reference / Cheque</th>
                    <th className="p-3 text-right">Amount Received</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-medium whitespace-nowrap">
                        {new Date(pay.paidAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        {pay.customerName || (pay as any).customer?.name || "Unknown"}
                      </td>
                      <td className="p-3">{getMethodBadge(pay.method)}</td>
                      <td className="p-3">
                        {pay.reference ? (
                          <span className="font-mono text-muted-foreground">{pay.reference}</span>
                        ) : (
                          <span className="text-muted-foreground/60">-</span>
                        )}
                        {pay.chequeDate && (
                          <span className="block text-[11px] text-purple-600 dark:text-purple-400">
                            Cheque Date: {new Date(pay.chequeDate).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                        LKR {Number(pay.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-muted-foreground max-w-xs truncate">
                        {pay.note || "-"}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSelectedPaymentForReceipt(pay);
                            setReceiptOpen(true);
                          }}
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Payment Receipt Modal */}
      <CustomerPaymentReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        payment={selectedPaymentForReceipt}
        customer={customers.find((c) => c.id === selectedPaymentForReceipt?.customerId)}
      />

      {/* Account Statement & Ledger Modal */}
      <CustomerStatementModal
        open={statementOpen}
        onClose={() => setStatementOpen(false)}
        customer={statementCustomer}
        sales={statementSales}
        payments={statementPayments}
      />
    </div>
  );
};
