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
          
        </CardHeader>
      </Card>
    </div>
  );
};

export default ShoppingCart;
