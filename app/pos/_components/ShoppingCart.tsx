import React from "react";

interface ShoppingCartProps {
  onCheckout: () => void;
}

const ShoppingCart = ({ onCheckout }: ShoppingCartProps) => {
  return <div>ShoppingCart</div>;
};

export default ShoppingCart;
