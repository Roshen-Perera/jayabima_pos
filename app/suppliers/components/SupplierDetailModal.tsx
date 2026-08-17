"use client";

import React, { useEffect, useState } from "react";
import { Supplier } from "../types/supplier.types";
import { PurchaseOrder } from "../types/purchaseOrder.types";
import { SupplierPayment, SupplierPaymentMethod } from "../types/supplierPayment.types";
import { alert } from "@/lib/alert";
import { useSupplierStore } from "@/store/supplierStore";
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
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Printer,
  Receipt,
  Truck,
} from "lucide-react";
import SupplierPaymentReceiptModal from "./SupplierPaymentReceiptModal";
import SupplierStatementModal from "./SupplierStatementModal";

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Payment dialog inside supplier detail
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<SupplierPaymentMethod>("CASH");
  const [payRef, setPayRef] = useState("");
  const [payChequeDate, setPayChequeDate] = useState("");
  const [payNote, setPayNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Receipt & Statement Modals State
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<SupplierPayment | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);

  const fetchSuppliers = useSupplierStore((s) => s.fetchSuppliers);

  const fetchSupplierOrders = async (id: string) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/purchase-orders?supplierId=${id}`);
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchSupplierPayments = async (id: string) => {
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/supplier-payments?supplierId=${id}`);
      if (res.ok) setPayments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchSupplierProducts = async (id: string) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/inventory`);
      if (res.ok) {
        const data = await res.json();
        const allProds = Array.isArray(data) ? data : data.products || [];
        setProducts(allProds.filter((p: any) => p.supplierId === id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (open && supplier) {
      fetchSupplierOrders(supplier.id);
      fetchSupplierPayments(supplier.id);
      fetchSupplierProducts(supplier.id);
    }
  }, [open, supplier]);

  if (!supplier) return null;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(payAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      alert.error("Invalid amount", "Please enter a valid payment amount greater than 0.");
      return;
    }

    const currentBalance = Number(supplier.payableBalance || 0);

    if (currentBalance <= 0) {
      alert.error(
        "No Payable Balance",
        `Supplier "${supplier.name}" has no outstanding payable balance to settle.`
      );
      return;
    }

    if (numAmt > currentBalance) {
      alert.error(
        "Overpayment Exceeded",
        `Payment amount (LKR ${numAmt.toLocaleString()}) cannot exceed the supplier's payable balance of LKR ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`
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
      const res = await fetch("/api/supplier-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplier.id,
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

      const recordedPay = await res.json();

      alert.success(
        "Payment Recorded!",
        `Recorded LKR ${numAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })} for ${supplier.name}`
      );

      // Open receipt modal
      setSelectedPaymentForReceipt(recordedPay);
      setReceiptOpen(true);

      setPayAmount("");
      setPayMethod("CASH");
      setPayRef("");
      setPayChequeDate("");
      setPayNote("");
      setPaymentDialogOpen(false);

      // Refresh payments & main store
      fetchSupplierPayments(supplier.id);
      fetchSuppliers();
    } catch (err: any) {
      console.error(err);
      alert.error("Payment error", err.message);
    } finally {
      setSubmittingPayment(false);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
          {/* Supplier Header */}
          <DialogHeader className="border-b pb-4 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                  {supplier.name}
                  <Badge
                    variant={supplier.active ? "default" : "secondary"}
                    className={supplier.active ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {supplier.active ? "Active" : "Inactive"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                  {supplier.contactPerson ? `Contact: ${supplier.contactPerson}` : "Supplier 360 Ledger & Details"}
                </DialogDescription>
              </div>

              {/* Payable balance card & quick actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 bg-muted/60 p-3 rounded-lg border w-full sm:w-auto">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Outstanding Balance</p>
                  <p
                    className={`text-base sm:text-lg font-bold ${
                      Number(supplier.payableBalance) > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    LKR {Number(supplier.payableBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatementOpen(true)}
                    className="gap-1.5 text-xs sm:text-sm border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-medium"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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

          {/* Supplier Metadata Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-3 text-xs bg-muted/30 p-3 rounded-lg border">
            {supplier.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{supplier.phone}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{supplier.email}</span>
              </div>
            )}
            {supplier.bankName && (
              <div className="flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{supplier.bankName} ({supplier.accountNumber || "No Acc"})</span>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{supplier.address}</span>
              </div>
            )}
          </div>

          {/* Tabs section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="orders" className="gap-2 text-xs sm:text-sm">
                <Truck className="w-4 h-4" /> Purchase Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 text-xs sm:text-sm">
                <Receipt className="w-4 h-4" /> Payments ({payments.length})
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2 text-xs sm:text-sm">
                <Package className="w-4 h-4" /> Products ({products.length})
              </TabsTrigger>
            </TabsList>

            {/* ── Purchase Orders Tab Content ──────────────────── */}
            <TabsContent value="orders" className="pt-3">
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 border rounded-lg text-muted-foreground text-sm">
                  No purchase orders found for this supplier.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {orders.map((po) => (
                    <div key={po.id} className="border rounded-lg p-3 text-xs bg-card space-y-2">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{po.orderNumber}</span>
                          <Badge
                            variant={po.status === "RECEIVED" ? "default" : "secondary"}
                            className={po.status === "RECEIVED" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          >
                            {po.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            Date: {new Date(po.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-primary">
                          LKR {Number(po.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                        {po.items?.map((item) => (
                          <div key={item.id} className="border p-1.5 rounded bg-muted/30 flex justify-between">
                            <span className="truncate">{item.productName || (item as any).product?.name}</span>
                            <span className="font-semibold shrink-0">
                              {item.quantity} x LKR {Number(item.cost).toFixed(2)}
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
                  No payment records found for this supplier.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-card max-h-96 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted uppercase text-muted-foreground border-b">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Reference / Cheque</th>
                        <th className="p-2.5 text-right">Amount</th>
                        <th className="p-2.5">Note</th>
                        <th className="p-2.5 text-center">Voucher</th>
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
                              onClick={() => {
                                setSelectedPaymentForReceipt(pay);
                                setReceiptOpen(true);
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="View / Print Payment Voucher"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ── Supplied Products Tab Content ─────────────────── */}
            <TabsContent value="products" className="pt-3">
              {loadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 border rounded-lg text-muted-foreground text-sm">
                  No products linked to this supplier catalog.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                  {products.map((p) => (
                    <div key={p.id} className="border rounded-lg p-3 text-xs bg-card space-y-1">
                      <p className="font-bold text-sm text-foreground truncate">{p.name}</p>
                      <p className="text-muted-foreground font-mono">SKU: {p.sku}</p>
                      <div className="flex justify-between items-center pt-2 border-t mt-1">
                        <span className="text-muted-foreground">Category: {p.category}</span>
                        <Badge
                          variant="outline"
                          className={p.stock <= (p.minStock || 0) ? "text-red-600 border-red-200" : ""}
                        >
                          Stock: {p.stock}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold pt-1">
                        <span className="text-muted-foreground">Cost: LKR {Number(p.cost).toLocaleString()}</span>
                        <span className="text-primary">Selling: LKR {Number(p.price).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
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
              <DialogTitle>Record Payment for {supplier.name}</DialogTitle>
              <DialogDescription>
                Current Outstanding Balance:{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  LKR {Number(supplier.payableBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="grid gap-2">
                <Label htmlFor="detPayAmount">Payment Amount (LKR) *</Label>
                <Input
                  id="detPayAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 50000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="detPayMethod">Payment Method *</Label>
                <Select
                  value={payMethod}
                  onValueChange={(val) => setPayMethod(val as SupplierPaymentMethod)}
                >
                  <SelectTrigger id="detPayMethod">
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
                  <Label htmlFor="detPayRef">
                    {payMethod === "CHEQUE" ? "Cheque Number *" : "Bank Transfer Ref / Txn ID"}
                  </Label>
                  <Input
                    id="detPayRef"
                    placeholder={payMethod === "CHEQUE" ? "e.g. CHQ-991200" : "e.g. TRX-771200"}
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                  />
                </div>
              )}

              {payMethod === "CHEQUE" && (
                <div className="grid gap-2">
                  <Label htmlFor="detPayChequeDate">Cheque Date / Realization Date</Label>
                  <Input
                    id="detPayChequeDate"
                    type="date"
                    value={payChequeDate}
                    onChange={(e) => setPayChequeDate(e.target.value)}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="detPayNote">Notes / Remarks</Label>
                <Textarea
                  id="detPayNote"
                  placeholder="Payment notes..."
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

      {/* Payment Voucher Modal */}
      <SupplierPaymentReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        payment={selectedPaymentForReceipt}
        supplier={supplier}
      />

      {/* Statement Modal */}
      <SupplierStatementModal
        open={statementOpen}
        onClose={() => setStatementOpen(false)}
        supplier={supplier}
        orders={orders}
        payments={payments}
      />
    </>
  );
};
