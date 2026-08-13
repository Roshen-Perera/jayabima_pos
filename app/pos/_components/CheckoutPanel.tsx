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
import {
  AlertCircle,
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  Receipt,
  ShoppingBag,
  Smartphone,
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
  { value: "MOBILE", label: "Mobile Pay", icon: <Smartphone className="w-4 h-4" /> },
  { value: "OTHER", label: "Other", icon: <Wallet className="w-4 h-4" /> },
];

export default function CheckoutPanel({
  open,
  onClose,
  onSuccess,
}: CheckoutPanelProps) {
  const { cart, customerId, customerName, setCustomer, clearCart } =
    usePOSStore();
  const { updateStock } = useProductStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashInput, setCashInput] = useState("");
  const [reference, setReference] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { addSale } = useSalesStore();

  // Reset state when dialog opens; auto-default to Walking Customer if none selected
  useEffect(() => {
    if (open) {
      setPaymentMethod("CASH");
      setCashInput("");
      setReference("");
      setChequeDate("");
      setIsProcessing(false);
      if (!customerId && customerName !== "Walking Customer") {
        setCustomer(undefined, "Walking Customer");
      }
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = cart.total;

  // Cash-specific derived values
  const cashPaid = parseFloat(cashInput) || 0;
  const cashBalance = cashPaid - total;
  const isCash = paymentMethod === "CASH";
  const isCredit = paymentMethod === "CREDIT";
  const isCheque = paymentMethod === "CHEQUE";
  const isBank = paymentMethod === "BANK_TRANSFER";

  const isCreditValid = !isCredit || (!!customerId && customerName !== "Walking Customer");
  const cashInputValid = !isCash || (cashInput !== "" && cashPaid >= total);
  const isFormValid = cashInputValid && isCreditValid;

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

    if (isCredit && (!customerId || customerName === "Walking Customer")) {
      alert.error(
        "Customer Required",
        "Please select a registered customer account for Credit (Pay Later) sales.",
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

      // Persist sale to database (also decrements stock & syncs customer.totalPurchases & creditBalance)
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
          reference: reference.trim() || undefined,
          chequeDate: isCheque && chequeDate ? chequeDate : undefined,
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
        status: "COMPLETED",
        createdAt: new Date(savedSale.createdAt),
      };

      // Update local product stock cache
      cart.items.forEach((item) => {
        updateStock(item.productId, item.quantity);
      });

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

          {/* Payment method selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(opt.value);
                    setCashInput("");
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors
                    ${
                      paymentMethod === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
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
                    {cashBalance >= 0 ? "Change / Balance" : "Shortfall"}
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

          {/* Credit Pay Later Warning */}
          {isCredit && (
            <div className="space-y-2 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Credit Purchase (Pay Later)
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                This purchase total of <strong className="text-foreground">Rs. {total.toLocaleString()}</strong> will be added directly to the customer's outstanding credit balance ledger.
              </p>

              {(!customerId || customerName === "Walking Customer") ? (
                <div className="p-2 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-medium rounded border border-red-200 text-[11px]">
                  ⚠️ Please close this panel and select a registered customer from the POS cart header before proceeding with Credit sale.
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
                : isCredit && (!customerId || customerName === "Walking Customer")
                  ? "Select Customer for Credit"
                  : `Confirm Payment · Rs. ${total.toLocaleString()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
