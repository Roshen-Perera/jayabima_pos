"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePOSStore } from "@/store/posStore";
import { ShoppingCart as CartIcon, Trash2 } from "lucide-react";
import React, { useState } from "react";
import CartItem from "./CartItem";

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
          <div className="flex-1 overflow-y-auto"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingCart;
