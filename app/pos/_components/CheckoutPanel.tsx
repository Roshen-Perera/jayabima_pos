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
  Banknote,
  CreditCard,
  ShoppingBag,
  Smartphone,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { PaymentMethod, Sale } from "../_types/pos.types";

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
  { value: "CASH", label: "Cash", icon: <Banknote className="w-5 h-5" /> },
  { value: "CARD", label: "Card", icon: <CreditCard className="w-5 h-5" /> },
  {
    value: "MOBILE",
    label: "Mobile Pay",
    icon: <Smartphone className="w-5 h-5" />,
  },
  { value: "OTHER", label: "Other", icon: <Wallet className="w-5 h-5" /> },
];

export default function CheckoutPanel({
  open,
  onClose,
  onSuccess,
}: CheckoutPanelProps) {
  const { cart, customerId, customerName, clearCart } = usePOSStore();
  const { updateStock } = useProductStore();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashInput, setCashInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentMethod("CASH");
      setCashInput("");
      setIsProcessing(false);
    }
  }, [open]);

  const total = cart.total;

  // Cash-specific derived values
  const cashPaid = parseFloat(cashInput) || 0;
  const cashBalance = cashPaid - total;
  const isCash = paymentMethod === "CASH";
  const cashInputValid = !isCash || (cashInput !== "" && cashPaid >= total);

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

      const sale: Sale = {
        id: `sale-${Date.now()}`,
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
        createdAt: new Date(),
      };

      // Deduct sold quantities from product stock
      cart.items.forEach((item) => {
        updateStock(item.productId, item.quantity);
      });

      clearCart();
      onSuccess(sale);
      onClose();
    } catch {
      alert.error("Checkout failed", "An error occurred. Please try again.");
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

          {/* Confirm button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isProcessing || !cashInputValid}
          >
            {isProcessing
              ? "Processing…"
              : isCash && cashInput === ""
                ? "Enter Cash Amount"
                : `Confirm Payment · Rs. ${total.toLocaleString()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
