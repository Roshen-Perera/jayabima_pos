import { Card } from "@/components/ui/card";
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
        
      </Card>
    </div>
  );
};

export default ShoppingCart;
