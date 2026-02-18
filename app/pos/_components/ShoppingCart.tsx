"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart as CartIcon,
  Trash2,
  Tag,
  Package,
  Minus,
  Plus,
  X,
  Percent,
} from "lucide-react";
import { usePOSStore } from "@/store/posStore";
import { useState } from "react";
import { alert } from "@/lib/alert";

interface ShoppingCartProps {
  onCheckout: () => void;
}

export default function ShoppingCart({ onCheckout }: ShoppingCartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, applyDiscount } =
    usePOSStore();

  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState("");
  const [showItemDiscountModal, setShowItemDiscountModal] = useState<
    string | null
  >(null);
  const [showPriceOverrideModal, setShowPriceOverrideModal] = useState<
    string | null
  >(null);

  const isEmpty = cart.items.length === 0;

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity(productId, quantity);
  };

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountValue);
    if (!isNaN(discount) && discount >= 0 && discount <= cart.subtotal) {
      applyDiscount(discount);
      setShowDiscountInput(false);
      setDiscountValue("");
      alert.success("Discount applied", `Rs. ${discount} discount added`);
    } else {
      alert.error("Invalid discount", "Please enter a valid discount amount");
    }
  };

  const handleRemoveDiscount = () => {
    applyDiscount(0);
    setDiscountValue("");
    alert.success("Discount removed", "Discount has been cleared");
  };

  return (
    <>
    </>
  );
}
