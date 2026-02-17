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
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) =>
            onUpdateQuantity(item.productId, parseInt(e.target.value) || 1)
          }
          className="h-7 w-12 text-center p-0 text-sm"
          min={1}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="text-right w-24 flex-shrink-0">
        <p className="font-semibold text-sm">
          Rs. {itemTotal.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
