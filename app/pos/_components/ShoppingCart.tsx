"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePOSStore } from "@/store/posStore";
import { ShoppingCart as CartIcon, Tag, Trash2 } from "lucide-react";
import React, { useState } from "react";
import CartItem from "./CartItem";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CartIcon className="h-5 w-5" />
              Cart
              {!isEmpty && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({cart.items.length} items)
                </span>
              )}
            </CardTitle>
            {!isEmpty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <CartIcon className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <p className="font-medium text-muted-foreground">
                  Cart is empty
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click a product to add it
                </p>
              </div>
            ) : (
              <div>
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>
          {!isEmpty && (
            <div className="flex-shrink-0 mt-4 space-y-3">
              {/* Discount Input */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Discount (Rs.)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="h-8 text-sm"
                    min={0}
                    max={cart.subtotal}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyDiscount}
                    className="h-8 text-xs px-3"
                  >
                    Apply
                  </Button>
                  {cart.discount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDiscount}
                      className="h-8 text-xs px-3 text-red-500"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    Rs. {cart.subtotal.toLocaleString()}
                  </span>
                </div>

                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>- Rs. {cart.discount.toLocaleString()}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    Rs. {cart.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={onCheckout}
                disabled={isEmpty}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingCart;
