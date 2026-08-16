"use client";

import React, { useEffect, useState } from "react";
import { CustomerPayment, CustomerPaymentMethod } from "../types/customerPayment.types";
import { alert } from "@/lib/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  Banknote,
  Calendar,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Receipt,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import CustomerPaymentReceiptModal from "./CustomerPaymentReceiptModal";
import CustomerStatementModal from "./CustomerStatementModal";

interface CustomerDetailModalProps {
  customer: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefreshCustomers?: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  open,
  onOpenChange,
  onRefreshCustomers,
}) => {
  const [activeTab, setActiveTab] = useState("sales");
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [sales, setSales] = useState<any[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);

  // Statement modal state
  const [statementOpen, setStatementOpen] = useState(false);

  // Payment dialog inside customer detail
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<CustomerPaymentMethod>("CASH");
  const [payRef, setPayRef] = useState("");
  const [payChequeDate, setPayChequeDate] = useState("");
  const [payNote, setPayNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Receipt modal state
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<CustomerPayment | null>(null);

  // Statement modal state
  const [statementOpen, setStatementOpen] = useState(false);

  const fetchCustomerSales = async (id: string) => {
    setLoadingSales(true);
    try {
      const res = await fetch(`/api/sales?customerId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSales(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSales(false);
    }
  };

  const fetchCustomerPayments = async (id: string) => {
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/customer-payments?customerId=${id}`);
      if (res.ok) setPayments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (open && customer) {
      fetchCustomerSales(customer.id);
      fetchCustomerPayments(customer.id);
    }
  }, [open, customer]);

  if (!customer) return null;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(payAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      alert.error("Invalid amount", "Please enter a valid payment amount greater than 0.");
      return;
    }

    const currentBalance = Number(customer.creditBalance || 0);

    if (currentBalance <= 0) {
      alert.error(
        "No Credit Owed",
        `Customer "${customer.name}" has no outstanding credit balance to settle.`
      );
      return;
    }

    if (numAmt > currentBalance) {
      alert.error(
        "Overpayment Exceeded",
        `Payment amount (LKR ${numAmt.toLocaleString()}) cannot exceed the customer's current balance of LKR ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`
      );
      return;
    }

    if (payMethod === "CHEQUE") {
      if (!payRef.trim()) {
        alert.error("Cheque Number Required", "Please enter the cheque number (e.g. CHQ-554411).");
        return;
      }
      if (!payChequeDate) {
        alert.error("Cheque Date Required", "Please select the cheque realization date.");
        return;
      }
    }

    if (payMethod === "BANK_TRANSFER" && !payRef.trim()) {
      alert.error("Bank Reference Required", "Please enter the bank transfer reference or transaction ID.");
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await fetch("/api/customer-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          amount: numAmt,
          method: payMethod,
          reference: payRef.trim() || undefined,
          chequeDate: payMethod === "CHEQUE" && payChequeDate ? payChequeDate : undefined,
          note: payNote.trim() || undefined,
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
        `Received LKR ${numAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })} from ${customer.name}`
      );

      setPayAmount("");
      setPayMethod("CASH");
      setPayRef("");
      setPayChequeDate("");
      setPayNote("");
      setPaymentDialogOpen(false);

      // Open receipt modal
      setSelectedPaymentForReceipt(createdPayment);
      setReceiptOpen(true);

      // Refresh payments & parent
      fetchCustomerPayments(customer.id);
      if (onRefreshCustomers) onRefreshCustomers();
    } catch (err: any) {
      console.error(err);
      alert.error("Payment error", err.message);
    } finally {
      setSubmittingPayment(false);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-220 max-h-[92vh] overflow-y-auto p-6">
          {/* Customer Header */}
          <DialogHeader className="border-b pb-4 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                  {customer.name}
                  <Badge
                    variant={customer.isActive ? "default" : "secondary"}
                    className={customer.isActive ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {customer.isActive ? "Active Customer" : "Inactive"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                  Customer 360 History &amp; Receivables Ledger
                </DialogDescription>
              </div>

              {/* Credit Balance Card & Quick Record */}
              <div className="flex items-center justify-between sm:justify-end gap-3 bg-muted/60 p-3 rounded-lg border w-full sm:w-auto">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Credit Balance (Owed)</p>
                  <p
                    className={`text-base sm:text-lg font-bold ${
                      Number(customer.creditBalance || 0) > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    LKR {Number(customer.creditBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatementOpen(true)}
                    className="gap-1.5 text-xs sm:text-sm border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-medium"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    View Statement
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPaymentDialogOpen(true)}
                    className="gap-1.5 text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4" /> Record Payment
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Customer Metadata Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-3 text-xs bg-muted/30 p-3 rounded-lg border">
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{customer.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Loyalty Points: <strong>{customer.loyaltyPoints || 0}</strong></span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <ShoppingBag className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Total Purchases: <strong>LKR {Number(customer.totalPurchases || 0).toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Tabs Section: Sales History | Payments */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2 w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sales" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Sales History ({sales.length})
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <Receipt className="w-4 h-4" />
                Payment Ledger ({payments.length})
              </TabsTrigger>
            </TabsList>

            {/* ── Sales History Tab Content ────────────────────── */}
            <TabsContent value="sales" className="pt-3">
              {loadingSales ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center py-8 border rounded-lg text-muted-foreground text-sm">
                  No purchase history found for this customer.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {sales.map((sale) => (
                    <div key={sale.id} className="border rounded-lg p-3 text-xs bg-card space-y-2">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Receipt #{sale.invoiceNumber || sale.id.substring(0, 8)}</span>
                          <Badge variant="outline">{sale.paymentMethod || "POS"}</Badge>
                          <span className="text-muted-foreground">
                            Date: {new Date(sale.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-primary">
                          LKR {Number(sale.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                        {sale.items?.map((item: any) => (
                          <div key={item.id} className="border p-1.5 rounded bg-muted/30 flex justify-between">
                            <span className="truncate">{item.productName || item.product?.name}</span>
                            <span className="font-semibold shrink-0">
                              {item.quantity} x LKR {Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Payment History Tab Content ───────────────────── */}
            <TabsContent value="payments" className="pt-3">
              {loadingPayments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 border rounded-lg text-muted-foreground text-sm">
                  No payment records found for this customer.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-card max-h-96 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted uppercase text-muted-foreground border-b">
                      <tr>
                        <th className="p-2.5">Date Received</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Reference / Cheque</th>
                        <th className="p-2.5 text-right">Amount Received</th>
                        <th className="p-2.5">Note</th>
                        <th className="p-2.5 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((pay) => (
                        <tr key={pay.id}>
                          <td className="p-2.5 font-medium">
                            {new Date(pay.paidAt).toLocaleDateString()}
                          </td>
                          <td className="p-2.5">{getMethodBadge(pay.method)}</td>
                          <td className="p-2.5 font-mono">
                            {pay.reference || "-"}
                            {pay.chequeDate && (
                              <span className="block text-[10px] text-purple-600 dark:text-purple-400">
                                Cheque Date: {new Date(pay.chequeDate).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            LKR {Number(pay.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-muted-foreground truncate max-w-xs">
                            {pay.note || "-"}
                          </td>
                          <td className="p-2.5 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
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
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inline Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleRecordPayment}>
            <DialogHeader>
              <DialogTitle>Record Payment from {customer.name}</DialogTitle>
              <DialogDescription>
                Current Credit Balance Owed:{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  LKR {Number(customer.creditBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="grid gap-2">
                <Label htmlFor="custPayAmount">Payment Amount (LKR) *</Label>
                <Input
                  id="custPayAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 25000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="custPayMethod">Payment Method *</Label>
                <Select
                  value={payMethod}
                  onValueChange={(val) => setPayMethod(val as CustomerPaymentMethod)}
                >
                  <SelectTrigger id="custPayMethod">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(payMethod === "BANK_TRANSFER" || payMethod === "CHEQUE") && (
                <div className="grid gap-2">
                  <Label htmlFor="custPayRef">
                    {payMethod === "CHEQUE" ? "Cheque Number *" : "Bank Transfer Ref / Txn ID"}
                  </Label>
                  <Input
                    id="custPayRef"
                    placeholder={payMethod === "CHEQUE" ? "e.g. CHQ-554411" : "e.g. TRX-100299"}
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                  />
                </div>
              )}

              {payMethod === "CHEQUE" && (
                <div className="grid gap-2">
                  <Label htmlFor="custPayChequeDate">Cheque Realization Date</Label>
                  <Input
                    id="custPayChequeDate"
                    type="date"
                    value={payChequeDate}
                    onChange={(e) => setPayChequeDate(e.target.value)}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="custPayNote">Notes / Remarks</Label>
                <Textarea
                  id="custPayNote"
                  placeholder="Payment remarks..."
                  rows={2}
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingPayment}>
                {submittingPayment ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Receipt Modal */}
      <CustomerPaymentReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        payment={selectedPaymentForReceipt}
        customer={customer}
      />

      {/* Account Statement & Ledger Modal */}
      <CustomerStatementModal
        open={statementOpen}
        onClose={() => setStatementOpen(false)}
        customer={customer}
        sales={sales}
        payments={payments}
      />
    </>
  );
};
