import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { usePOSStore } from "@/store/posStore";
import { ShoppingCart as CartIcon, Trash2 } from "lucide-react";
import React from "react";

interface ShoppingCartProps {
  onCheckout: () => void;
}

const ShoppingCart = ({ onCheckout }: ShoppingCartProps) => {
  const { cart, updateQuantity, removeFromCart, clearCart } = usePOSStore();
  const isEmpty = cart.items.length === 0;
  return (
    <div>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CartIcon className="h-5 w-5" />
              Cart ({cart.items.length})
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ShoppingCart;
