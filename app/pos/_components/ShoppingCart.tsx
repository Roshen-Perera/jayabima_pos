"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePOSStore } from "@/store/posStore";
import { Banknote, ShoppingCart as CartIcon, Check, CreditCard, Edit, Minus, Package, Percent, Plus, QrCode, Tag, Trash2, Users, X } from "lucide-react";
import React, { useState } from "react";
import CartItem from "./CartItem";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShoppingCartProps {
  onCheckout: () => void;
}

const ShoppingCart = ({ onCheckout }: ShoppingCartProps) => {
  const { cart, updateQuantity, removeFromCart, clearCart, applyDiscount } =
    usePOSStore();
  const [discountInput, setDiscountInput] = useState("");
  const isEmpty = cart.items.length === 0;
  const handleApplyDiscount = () => {
    const discount = parseFloat(discountInput);
    if (!isNaN(discount) && discount >= 0 && discount <= cart.subtotal) {
      applyDiscount(discount);
    }
  };
  const handleRemoveDiscount = () => {
    applyDiscount(0);
    setDiscountInput("");
  };
  return (
    <div>
      <Card
        className="flex-[3] flex flex-col min-w-[320px] max-w-[400px] overflow-hidden"
      >
        <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between py-3 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Current Sale</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {cart.items.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {cart.items.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => clearCart()}
                  className="w-8 h-8 text-muted-foreground hover:text-destructive"
                  title="Clear cart"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Cart Items - Scrollable */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-2">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs">Click products or scan barcode</p>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-muted-foreground">
                            Rs. {item.price.toLocaleString()} / {item.unit}
                          </p>
                          {item.discount > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              -{item.discount}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => setShowItemDiscountModal(item.id)}
                          title="Add discount"
                        >
                          <Percent className="w-3 h-3" />
                        </Button>
                        {(user?.role === "admin" ||
                          user?.role === "manager") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => setShowPriceOverrideModal(item.id)}
                            title="Override price"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Remove item"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-12 h-7 text-center text-sm px-1"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="font-semibold text-sm">
                        Rs. {item.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Totals & Payment - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-border bg-card">
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>
                    Discount (
                    {discountType === "percentage" ? `${discount}%` : "Fixed"})
                  </span>
                  <span>
                    -Rs.{" "}
                    {(discountType === "percentage"
                      ? (subtotal * discount) / 100
                      : discount
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground h-8"
                onClick={() => setShowDiscountModal(true)}
              >
                <Percent className="w-4 h-4 mr-2" />
                {discount > 0 ? "Change Discount" : "Add Discount"}
              </Button>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="p-4 pt-0 space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  size="sm"
                  disabled={cartItems.length === 0}
                  onClick={() => setPaymentMethod("cash")}
                  className="flex-col gap-0.5 h-auto py-2"
                >
                  <Banknote className="w-4 h-4" />
                  <span className="text-[10px]">Cash</span>
                </Button>
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  size="sm"
                  disabled={cartItems.length === 0}
                  onClick={() => setPaymentMethod("card")}
                  className="flex-col gap-0.5 h-auto py-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px]">Card</span>
                </Button>
                <Button
                  variant={paymentMethod === "qr" ? "default" : "outline"}
                  size="sm"
                  disabled={cartItems.length === 0}
                  onClick={() => setPaymentMethod("qr")}
                  className="flex-col gap-0.5 h-auto py-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-[10px]">QR</span>
                </Button>
                <Button
                  variant={paymentMethod === "credit" ? "default" : "outline"}
                  size="sm"
                  disabled={cartItems.length === 0 || !customerId}
                  onClick={() => setPaymentMethod("credit")}
                  className="flex-col gap-0.5 h-auto py-2"
                  title={!customerId ? "Select customer first" : "Credit sale"}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-[10px]">Credit</span>
                </Button>
              </div>

              <Button
                variant="pos-primary"
                size="lg"
                disabled={cartItems.length === 0}
                className="w-full gap-2"
                onClick={() => setShowPayment(true)}
              >
                <Check className="w-5 h-5" />
                Complete Sale (F1)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingCart;
