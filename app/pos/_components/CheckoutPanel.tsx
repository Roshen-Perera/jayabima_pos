import { usePOSStore } from "@/store/posStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { PaymentMethod } from "../_types/pos.types";
import { alert } from "@/lib/alert";

interface CheckoutPanelProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (saleId: string) => void;
}

const CheckoutPanel = ({ open, onClose, onSuccess }: CheckoutPanelProps) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, clearCart } = usePOSStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert.error("Not logged in", "Please log in to process sales.");
      return;
    }
    if (cart.items.length === 0) {
      alert.error("Cart is empty", "Add products before checkout.");
      return;
    }
    setIsProcessing(true);
    try {
      const saleData = {
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        userId: user.id,
        userName: user.name,
        subtotal: cart.subtotal,
        discount: cart.discount,
        total: cart.total,
        paymentMethod,
      };
    } catch (error) {}
  };
  return <div>CheckoutPanel</div>;
};

export default CheckoutPanel;
