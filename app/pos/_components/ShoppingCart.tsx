import { Card, CardHeader } from "@/components/ui/card";
import { usePOSStore } from "@/store/posStore";
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
                
            </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ShoppingCart;
