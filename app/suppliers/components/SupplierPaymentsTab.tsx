"use client";

import React, { useEffect, useState } from "react";
import { alert } from "@/lib/alert";
import { useSupplierStore } from "@/store/supplierStore";
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
  Loader2,
  Plus,
  Receipt,
} from "lucide-react";
import { SupplierPayment, SupplierPaymentMethod } from "../types/supplierPayment.types";

export const SupplierPaymentsTab = () => {
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>("all");

  const suppliers = useSupplierStore((s) => s.suppliers);
  const fetchSuppliers = useSupplierStore((s) => s.fetchSuppliers);

  // Form State
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<SupplierPaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);

  const fetchPayments = async (suppId?: string) => {
    setLoading(true);
    try {
      const url =
        suppId && suppId !== "all"
          ? `/api/supplier-payments?supplierId=${suppId}`
          : "/api/supplier-payments";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Error fetching supplier payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(selectedSupplierFilter);
  }, [selectedSupplierFilter]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert.error("Supplier required", "Please select a supplier.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert.error("Invalid amount", "Please enter a valid payment amount greater than 0.");
      return;
    }

    const selectedSupp = suppliers.find((s) => s.id === supplierId);
    const currentBalance = Number(selectedSupp?.payableBalance || 0);

    if (currentBalance <= 0) {
      alert.error(
        "No Payable Balance",
        `Supplier "${selectedSupp?.name}" has no outstanding payable balance to settle.`
      );
      return;
    }

    if (numAmount > currentBalance) {
      alert.error(
        "Overpayment Exceeded",
        `Payment amount (LKR ${numAmount.toLocaleString()}) cannot exceed the supplier's payable balance of LKR ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`
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
      const res = await fetch("/api/supplier-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
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

      alert.success(
        "Payment Recorded!",
        `Successfully recorded payment of LKR ${numAmount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`
      );

      // Reset form
      setSupplierId("");
      setAmount("");
      setMethod("CASH");
      setReference("");
      setChequeDate("");
      setNote("");
      setPaidAt(new Date().toISOString().split("T")[0]);
      setCreateOpen(false);

      // Refresh payments & updated supplier balances
      fetchPayments(selectedSupplierFilter);
      fetchSuppliers();
    } catch (err: any) {
      console.error(err);
      alert.error("Error recording payment", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getMethodBadge = (m: SupplierPaymentMethod) => {
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

  const activeSuppliers = suppliers.filter((s) => s.active);
  const selectedSupplierObj = suppliers.find((s) => s.id === supplierId);

  return (
    <div className="space-y-4">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Supplier Payments &amp; Accounts Payable</h2>
          <p className="text-sm text-muted-foreground">
            Record payments (cash, bank transfers, post-dated cheques) and track supplier balances.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreatePayment}>
              <DialogHeader>
                <DialogTitle>Record Supplier Payment</DialogTitle>
                <DialogDescription>
                  Enter payment details to reduce the outstanding payable balance for a supplier.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                {/* Supplier select */}
                <div className="grid gap-2">
                  <Label htmlFor="paySupplier">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger id="paySupplier">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSuppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} (Balance: LKR {Number(s.payableBalance).toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show active balance indicator */}
                {selectedSupplierObj && (
                  <div className="p-3 bg-muted/60 rounded-md flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Current Payable Balance:</span>
                    <span
                      className={`font-bold text-sm ${
                        Number(selectedSupplierObj.payableBalance) > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      LKR {Number(selectedSupplierObj.payableBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* Amount */}
                <div className="grid gap-2">
                  <Label htmlFor="payAmount">Payment Amount (LKR) *</Label>
                  <Input
                    id="payAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Payment Method */}
                <div className="grid gap-2">
                  <Label htmlFor="payMethod">Payment Method *</Label>
                  <Select
                    value={method}
                    onValueChange={(val) => setMethod(val as SupplierPaymentMethod)}
                  >
                    <SelectTrigger id="payMethod">
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
                    <Label htmlFor="payRef">
                      {method === "CHEQUE" ? "Cheque Number *" : "Bank Transfer Ref / Txn ID"}
                    </Label>
                    <Input
                      id="payRef"
                      placeholder={method === "CHEQUE" ? "e.g. CHQ-998812" : "e.g. TRX-771239"}
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                )}

                {/* Cheque Date if Cheque */}
                {method === "CHEQUE" && (
                  <div className="grid gap-2">
                    <Label htmlFor="payChequeDate">Cheque Date / Realization Date</Label>
                    <Input
                      id="payChequeDate"
                      type="date"
                      value={chequeDate}
                      onChange={(e) => setChequeDate(e.target.value)}
                    />
                  </div>
                )}

                {/* Payment Date */}
                <div className="grid gap-2">
                  <Label htmlFor="payDate">Date Paid *</Label>
                  <Input
                    id="payDate"
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                </div>

                {/* Note */}
                <div className="grid gap-2">
                  <Label htmlFor="payNote">Notes / Remarks (Optional)</Label>
                  <Textarea
                    id="payNote"
                    placeholder="e.g. Part payment for PO-20260813-1029..."
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
      <div className="flex items-center gap-3 bg-card p-3 rounded-lg border">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Filter by Supplier:</span>
        <select
          className="border rounded-md px-3 py-1 text-sm bg-background text-foreground"
          value={selectedSupplierFilter}
          onChange={(e) => setSelectedSupplierFilter(e.target.value)}
        >
          <option value="all">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (Balance: LKR {Number(s.payableBalance).toLocaleString()})
            </option>
          ))}
        </select>
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
          <h3 className="text-lg font-semibold mb-2">No payment records found</h3>
          <p className="text-muted-foreground text-sm">
            Record supplier payments to keep track of settled debts, cash upfronts, and post-dated cheques.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-xs uppercase text-muted-foreground border-b font-medium">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Reference / Cheque</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-medium whitespace-nowrap">
                        {new Date(pay.paidAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        {pay.supplierName || (pay as any).supplier?.name || "Unknown"}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
