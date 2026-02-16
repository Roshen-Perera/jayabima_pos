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
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(item.productId, newQuantity);
    }
  };
  const itemTotal = item.price * item.quantity;
  return (
    <div>
      <div className="flex items-center gap-3 py-3 border-b">
        {item.image ? (
          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-muted-foreground">No img</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            ${item.price.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQuantityChange(item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            className="h-7 w-12 text-center p-0"
            min={1}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-right w-20">
          <p className="font-semibold text-sm">${itemTotal.toFixed(2)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onRemove(item.productId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
