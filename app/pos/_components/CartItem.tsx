import React from "react";
import { CartItem as CartItemType } from "../_types/pos.types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const itemTotal = item.price * item.quantity;
  return (
    <div className="flex items-center gap-2 py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Rs. {item.price.toLocaleString()} each
        </p>
      </div>
    </div>
  );
};

export default CartItem;
