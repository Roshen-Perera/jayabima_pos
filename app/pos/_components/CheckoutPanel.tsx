"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { alert } from "@/lib/alert";
import { usePOSStore } from "@/store/posStore";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCustomerStore } from "@/store/customerStore";
import {
  AlertCircle,
  BadgePercent,
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  Layers,
  Plus,
  Receipt,
  ShoppingBag,
  Smartphone,
  Trash2,
  UserCheck,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { PaymentMethod, Sale } from "../_types/pos.types";
import { useSalesStore } from "@/store/salesStore";

interface CheckoutPanelProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

interface SplitRow {
  method: "CASH" | "CHEQUE" | "BANK_TRANSFER" | "CARD";
  amount: string;
  reference: string;
  chequeDate: string;
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "CASH", label: "Cash", icon: <Banknote className="w-4 h-4" /> },
  { value: "CARD", label: "Card", icon: <CreditCard className="w-4 h-4" /> },
  { value: "CREDIT", label: "Credit (Pay Later)", icon: <UserCheck className="w-4 h-4" /> },
  { value: "CHEQUE", label: "Cheque", icon: <Receipt className="w-4 h-4" /> },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: <Landmark className="w-4 h-4" /> },
  { value: "PARTIAL", label: "Single Partial Payment", icon: <BadgePercent className="w-4 h-4" /> },
  { value: "SPLIT", label: "Split / Multi-Payment", icon: <Layers className="w-4 h-4" /> },
];

export default function CheckoutPanel({
  open,
  onClose,
  onSuccess,
}: CheckoutPanelProps) {
  const { cart, customerId, customerName, setCustomer, clearCart } =
    usePOSStore();
  const { customers, loadCustomers } = useCustomerStore();
  const { updateStock } = useProductStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashInput, setCashInput] = useState("");
  const [excessHandling, setExcessHandling] = useState<"CHANGE" | "CREDIT_BALANCE">("CHANGE");
  const [reference, setReference] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  
  // Partial & Split states
  const [partialPaid, setPartialPaid] = useState("");
  const [partialMethod, setPartialMethod] = useState<"CASH" | "CHEQUE" | "BANK_TRANSFER">("CASH");
  const [splitRows, setSplitRows] = useState<SplitRow[]>([
    { method: "CASH", amount: "", reference: "", chequeDate: "" },
    { method: "CHEQUE", amount: "", reference: "", chequeDate: "" },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const { addSale } = useSalesStore();

  useEffect(() => {
    if (open) {
      setPaymentMethod("CASH");
      setCashInput("");
      setExcessHandling("CHANGE");
      setReference("");
      setChequeDate("");
      setPartialPaid("");
      setPartialMethod("CASH");
      setSplitRows([
        { method: "CASH", amount: "", reference: "", chequeDate: "" },
        { method: "CHEQUE", amount: "", reference: "", chequeDate: "" },
      ]);
      setIsProcessing(false);
      if (!customerId && customerName !== "Walking Customer") {
        setCustomer(undefined, "Walking Customer");
      }
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = cart.total;

  const addSplitRow = (method: "CASH" | "CHEQUE" | "BANK_TRANSFER" | "CARD" = "CHEQUE") => {
    setSplitRows((prev) => [...prev, { method, amount: "", reference: "", chequeDate: "" }]);
  };

  const removeSplitRow = (index: number) => {
    setSplitRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSplitRow = (index: number, field: keyof SplitRow, value: string) => {
    setSplitRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Mode flags
  const isCash = paymentMethod === "CASH";
  const isCredit = paymentMethod === "CREDIT";
  const isCheque = paymentMethod === "CHEQUE";
  const isBank = paymentMethod === "BANK_TRANSFER";
  const isPartial = paymentMethod === "PARTIAL";
  const isSplit = paymentMethod === "SPLIT";

  // Calculations
  const cashPaid = parseFloat(cashInput) || 0;
  const cashBalance = cashPaid - total;

  const partialPaidAmt = parseFloat(partialPaid) || 0;
  const partialUnpaidAmt = Math.max(0, total - partialPaidAmt);

  const splitTotalPaid = splitRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const splitUnpaidAmt = Math.max(0, total - splitTotalPaid);

  const requiresCustomer = isCredit || isPartial || (isSplit && splitUnpaidAmt > 0);
  const isCustomerValid = !requiresCustomer || (!!customerId && customerName !== "Walking Customer");

  const cashInputValid = !isCash || (cashInput !== "" && cashPaid >= total);
  const partialInputValid = !isPartial || (partialPaidAmt > 0 && partialPaidAmt <= total);
  const splitInputValid = !isSplit || (splitTotalPaid > 0 && splitTotalPaid <= total);

  const isFormValid = cashInputValid && partialInputValid && splitInputValid && isCustomerValid;

  // Quick cash presets (round numbers >= total)
  const presets = Array.from(
    new Set([
      Math.ceil(total / 100) * 100,
      Math.ceil(total / 500) * 500,
      Math.ceil(total / 1000) * 1000,
    ]),
  ).filter((v) => v >= total);

  const handleCheckout = async () => {
    if (isCash && cashPaid < total) {
      alert.error(
        "Insufficient cash",
        "Cash paid must be at least the total amount.",
      );
      return;
    }

    if (requiresCustomer && (!customerId || customerName === "Walking Customer")) {
      alert.error(
        "Customer Account Required",
        "Please select a registered customer account for Credit, Partial, or Split payment sales.",
      );
      return;
    }

    setIsProcessing(true);

    try {
      const originalTotal = cart.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
      const itemDiscount = cart.items.reduce(
        (sum, i) => sum + (i.price - (i.overridePrice ?? i.price)) * i.quantity,
        0,
      );
      const totalSavings = itemDiscount + (cart.discount ?? 0);

      // Construct payment lines array for backend ledger
      let paymentsPayload: any[] | undefined = undefined;

      if (isSplit) {
        paymentsPayload = splitRows
          .filter((r) => (parseFloat(r.amount) || 0) > 0)
          .map((r) => ({
            method: r.method,
            amount: parseFloat(r.amount),
            reference: r.reference.trim() || undefined,
            chequeDate: r.method === "CHEQUE" && r.chequeDate ? r.chequeDate : undefined,
          }));
      } else if (isPartial) {
        paymentsPayload = [
          {
            method: partialMethod,
            amount: partialPaidAmt,
            reference: reference.trim() || undefined,
            chequeDate: partialMethod === "CHEQUE" && chequeDate ? chequeDate : undefined,
          },
        ];
      }

      // Persist sale to database
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId || null,
          customerName: customerName || null,
          userId: user?.id ?? "unknown",
          originalTotal,
          itemDiscount,
          discount: cart.discount,
          totalSavings,
          total,
          paymentMethod,
          cashPaid: isCash ? cashPaid : null,
          cashBalance: isCash ? cashBalance : null,
          excessHandling: isCash && cashBalance > 0 && customerId && customerName !== "Walking Customer" ? excessHandling : "CHANGE",
          excessAmount: isCash && cashBalance > 0 && customerId && customerName !== "Walking Customer" && excessHandling === "CREDIT_BALANCE" ? cashBalance : 0,
          reference: reference.trim() || undefined,
          chequeDate: isCheque && chequeDate ? chequeDate : undefined,
          payments: paymentsPayload,
          status: "COMPLETED",
          items: cart.items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            quantity: Number(i.quantity),
            price: Number(i.overridePrice ?? i.price),
            total: Number(i.overridePrice ?? i.price) * Number(i.quantity),
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record sale");
      }

      const savedSale = await res.json();

      const sale: Sale = {
        id: savedSale.id,
        items: cart.items,
        customerId,
        customerName,
        userId: user?.id ?? "unknown",
        userName: user?.name ?? "Staff",
        originalTotal,
        itemDiscount,
        totalSavings,
        discount: cart.discount,
        total,
        paymentMethod,
        ...(isCash && { cashPaid, cashBalance }),
        excessHandling: isCash && cashBalance > 0 && customerId && customerName !== "Walking Customer" ? excessHandling : "CHANGE",
        excessAmount: isCash && cashBalance > 0 && customerId && customerName !== "Walking Customer" && excessHandling === "CREDIT_BALANCE" ? cashBalance : 0,
        status: "COMPLETED",
        createdAt: new Date(savedSale.createdAt),
      };

      // Update local product stock cache & refresh customer credit balance store
      cart.items.forEach((item) => {
        updateStock(item.productId, item.quantity);
      });

      await loadCustomers();
      addSale(sale);
      clearCart();
      onSuccess(sale);
      onClose();
    } catch (err: any) {
      console.error("Checkout error:", err);
      // Show detailed validation errors if available
      const message = err.message || "An error occurred. Please try again.";
      alert.error("Checkout failed", message);
      setIsProcessing(false); // explicitly reset so user can retry without closing dialog
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order summary */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Items</span>
              <span>{cart.items.length}</span>
            </div>
            {/* Item-level discounts */}
            {(() => {
              const itemDiscount = cart.items.reduce(
                (sum, i) =>
                  sum + (i.price - (i.overridePrice ?? i.price)) * i.quantity,
                0,
              );
              return itemDiscount > 0 ? (
                <div className="flex justify-between text-green-600">
                  <span>Item Discounts</span>
                  <span>-Rs. {itemDiscount.toLocaleString()}</span>
                </div>
              ) : null;
            })()}
            {/* Subtotal after item discounts (shown when cart discount also active) */}
            {cart.discount > 0 &&
              cart.items.some((i) => i.overridePrice !== undefined) && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rs. {cart.subtotal.toLocaleString()}</span>
                </div>
              )}
            {/* Cart-level discount */}
            {cart.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Cart Discount</span>
                <span>-Rs. {cart.discount.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Customer Context & Accounts Receivable Summary */}
          <div className="text-xs p-3 rounded-lg border bg-muted/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground">
                  {customerName || "Walking Customer"}
                </span>
              </div>
              {!customerId || customerName === "Walking Customer" ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground border">
                  Walk-In
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200">
                  Registered Account
                </span>
              )}
            </div>

            {customerId && customerName !== "Walking Customer" && (
              <div className="pt-2 border-t border-dashed space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous Credit Owed:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Rs. {Number(customers.find((c) => c.id === customerId)?.creditBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Bill Credit Added:</span>
                  <span className="font-semibold text-amber-600">
                    +Rs. {(
                      isCredit ? total : isPartial ? partialUnpaidAmt : isSplit ? splitUnpaidAmt : 0
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t text-destructive">
                  <span>Total Debt Owed After Bill:</span>
                  <span>
                    Rs. {(
                      Number(customers.find((c) => c.id === customerId)?.creditBalance || 0) +
                      (isCredit ? total : isPartial ? partialUnpaidAmt : isSplit ? splitUnpaidAmt : 0)
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment method selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_OPTIONS.map((opt) => {
                const isWalkingCustomer = !customerId || customerName === "Walking Customer";
                const isAccountReq =
                  opt.value === "CREDIT" ||
                  opt.value === "CHEQUE" ||
                  opt.value === "PARTIAL" ||
                  opt.value === "SPLIT";
                const isDisabled = isWalkingCustomer && isAccountReq;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      if (isDisabled) {
                        alert.error(
                          "Registered Customer Required",
                          "Walking Customers can pay via Cash, Card, or Bank Transfer. Please select a registered customer for Credit, Cheque, or Split payments."
                        );
                        return;
                      }
                      setPaymentMethod(opt.value);
                      setCashInput("");
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left
                      ${
                        paymentMethod === opt.value
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : isDisabled
                            ? "border-border bg-muted/40 text-muted-foreground/60 cursor-not-allowed"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isDisabled && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground shrink-0 border">
                        Account Req
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash input — only for CASH */}
          {isCash && (
            <div className="space-y-2">
              <Label htmlFor="cashInput" className="text-sm font-medium">
                Cash Received (Rs.)
              </Label>

              {/* Quick preset buttons */}
              <div className="flex gap-2 flex-wrap">
                {presets.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCashInput(String(p))}
                  >
                    Rs. {p.toLocaleString()}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setCashInput(String(total))}
                >
                  Exact
                </Button>
              </div>

              <Input
                id="cashInput"
                type="number"
                placeholder={`Min Rs. ${total.toLocaleString()}`}
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                min={total}
                className={
                  cashInput !== "" && cashPaid < total
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />

              {/* Live balance feedback */}
              {cashInput !== "" && (
                <div
                  className={`flex justify-between text-sm font-medium px-3 py-2 rounded-lg ${
                    cashBalance >= 0
                      ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }`}
                >
                  <span>
                    {cashBalance >= 0 ? "Change / Excess" : "Shortfall"}
                  </span>
                  <span>
                    Rs.{" "}
                    {Math.abs(cashBalance).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {/* Excess handling choice for registered customers */}
              {cashInput !== "" && cashBalance > 0 && customerId && customerName !== "Walking Customer" && (
                <div className="space-y-2 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-lg text-xs">
                  <div className="flex items-center justify-between font-semibold text-blue-950 dark:text-blue-200">
                    <span>Excess Cash Action:</span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                      Rs. {cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setExcessHandling("CHANGE")}
                      className={`p-2 rounded-md border text-xs font-medium text-left flex flex-col gap-0.5 transition-all ${
                        excessHandling === "CHANGE"
                          ? "border-green-600 bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-200 font-bold ring-2 ring-green-600/30"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-1">💵 Cash Change</span>
                      <span className="text-[10px] opacity-75 font-normal">Hand Rs. {cashBalance.toLocaleString()} change</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExcessHandling("CREDIT_BALANCE")}
                      className={`p-2 rounded-md border text-xs font-medium text-left flex flex-col gap-0.5 transition-all ${
                        excessHandling === "CREDIT_BALANCE"
                          ? "border-blue-600 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-600/30"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-1">💳 Account Credit</span>
                      <span className="text-[10px] opacity-75 font-normal">Transfer to credit balance</span>
                    </button>
                  </div>

                  {excessHandling === "CREDIT_BALANCE" && (
                    <div className="mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-[11px] space-y-1">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Current Debt Balance:</span>
                        <span>Rs. {Number(customers.find((c) => c.id === customerId)?.creditBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-blue-800 dark:text-blue-300">
                        <span>New Balance After Credit:</span>
                        <span>
                          Rs. {Math.max(0, Number(customers.find((c) => c.id === customerId)?.creditBalance || 0) - cashBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          {Number(customers.find((c) => c.id === customerId)?.creditBalance || 0) - cashBalance < 0 && (
                            <span className="text-[10px] text-green-600 ml-1">
                              (Rs. {Math.abs(Number(customers.find((c) => c.id === customerId)?.creditBalance || 0) - cashBalance).toLocaleString()} Store Credit)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cheque Inputs */}
          {isCheque && (
            <div className="space-y-3 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800 text-xs">
              <div className="space-y-1">
                <Label htmlFor="chequeRef" className="text-xs font-semibold">Cheque Number *</Label>
                <Input
                  id="chequeRef"
                  placeholder="e.g. CHQ-889922"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="bg-background text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="chequeDate" className="text-xs font-semibold">Cheque Realization Date</Label>
                <Input
                  id="chequeDate"
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  className="bg-background text-xs h-8"
                />
              </div>
            </div>
          )}

          {/* Bank Transfer Inputs */}
          {isBank && (
            <div className="space-y-2 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 text-xs">
              <Label htmlFor="bankRef" className="text-xs font-semibold">Bank Transfer Reference / Txn ID</Label>
              <Input
                id="bankRef"
                placeholder="e.g. TRX-998811"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="bg-background text-xs h-8"
              />
            </div>
          )}

          {/* Single Partial Payment Inputs */}
          {isPartial && (
            <div className="space-y-3 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-xs">
              <div className="flex justify-between items-center text-amber-900 dark:text-amber-200 font-semibold">
                <span>Single Partial Payment</span>
                <span className="text-[11px] font-normal text-muted-foreground">Upfront + Credit Remainder</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="partialMethod" className="text-xs">Upfront Method *</Label>
                  <select
                    id="partialMethod"
                    className="w-full border rounded p-1.5 text-xs bg-background"
                    value={partialMethod}
                    onChange={(e) => setPartialMethod(e.target.value as any)}
                  >
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="partialPaid" className="text-xs">Amount Paid (Rs.) *</Label>
                  <Input
                    id="partialPaid"
                    type="number"
                    step="0.01"
                    placeholder={`Max ${total}`}
                    className="h-8 text-xs bg-background"
                    value={partialPaid}
                    onChange={(e) => setPartialPaid(e.target.value)}
                  />
                </div>
              </div>

              {partialMethod === "CHEQUE" && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed">
                  <Input
                    placeholder="Cheque No."
                    className="h-7 text-xs bg-background"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                  <Input
                    type="date"
                    className="h-7 text-xs bg-background"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                  />
                </div>
              )}

              {partialMethod === "BANK_TRANSFER" && (
                <Input
                  placeholder="Bank Ref / Txn ID"
                  className="h-7 text-xs bg-background"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              )}

              <div className="pt-2 border-t text-xs space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Upfront Payment:</span>
                  <span className="font-semibold text-foreground">
                    Rs. {partialPaidAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Remaining Credit Balance:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Rs. {partialUnpaidAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Split Multi-Payment Builder */}
          {isSplit && (
            <div className="space-y-3 p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900 dark:text-blue-200">
                  Multi-Payment Breakdown
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSplitRow("CHEQUE")}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Line
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {splitRows.map((row, idx) => (
                  <div key={idx} className="p-2 border rounded bg-card text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        className="border rounded p-1 text-xs bg-background shrink-0"
                        value={row.method}
                        onChange={(e) => updateSplitRow(idx, "method", e.target.value)}
                      >
                        <option value="CASH">Cash</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CARD">Card</option>
                      </select>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount (Rs.)"
                        className="h-7 text-xs flex-1"
                        value={row.amount}
                        onChange={(e) => updateSplitRow(idx, "amount", e.target.value)}
                      />
                      {splitRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSplitRow(idx)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {row.method === "CHEQUE" && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed">
                        <Input
                          placeholder="Cheque No."
                          className="h-7 text-xs"
                          value={row.reference}
                          onChange={(e) => updateSplitRow(idx, "reference", e.target.value)}
                        />
                        <Input
                          type="date"
                          className="h-7 text-xs"
                          value={row.chequeDate}
                          onChange={(e) => updateSplitRow(idx, "chequeDate", e.target.value)}
                        />
                      </div>
                    )}

                    {row.method === "BANK_TRANSFER" && (
                      <Input
                        placeholder="Bank Ref / Txn ID"
                        className="h-7 text-xs"
                        value={row.reference}
                        onChange={(e) => updateSplitRow(idx, "reference", e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t text-xs space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Payments Added:</span>
                  <span className="font-semibold text-foreground">
                    Rs. {splitTotalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Remaining Credit Balance:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Rs. {splitUnpaidAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Credit Pay Later Warning */}
          {(isCredit || (requiresCustomer && (!customerId || customerName === "Walking Customer"))) && (
            <div className="space-y-2 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Customer Account Required
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Sales involving Credit, Partial, or Split remainder require a registered customer account to track the balance.
              </p>

              {(!customerId || customerName === "Walking Customer") ? (
                <div className="p-2 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-medium rounded border border-red-200 text-[11px]">
                  ⚠️ Please select a customer from the POS cart header before confirming this transaction.
                </div>
              ) : (
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium rounded border border-emerald-200 text-[11px]">
                  Selected Customer: <strong>{customerName}</strong>
                </div>
              )}
            </div>
          )}

          {/* Confirm button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isProcessing || !isFormValid}
          >
            {isProcessing
              ? "Processing…"
              : isCash && cashInput === ""
                ? "Enter Cash Amount"
                : requiresCustomer && (!customerId || customerName === "Walking Customer")
                  ? "Select Customer Account"
                  : `Confirm Payment · Rs. ${total.toLocaleString()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
