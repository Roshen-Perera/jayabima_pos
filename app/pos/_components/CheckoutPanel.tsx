import { usePOSStore } from "@/store/posStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { PaymentMethod } from "../_types/pos.types";
import { alert } from "@/lib/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

      const response = await fetch("/api/pos/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (result.success) {
        alert.success("Sale completed!", `Total: $${cart.total.toFixed(2)}`);
        clearCart();
        onSuccess(result.sale.id);
        onClose();
      } else {
        alert.error(
          "Sale failed",
          result.message || "Could not complete sale.",
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert.error("Checkout failed", "An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
            
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPanel;
