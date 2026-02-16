import React from "react";
import { CartItem as CartItemType } from "../_types/pos.types";

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
  return <div>CartItem</div>;
};

export default CartItem;
