import { usePOSStore } from "@/store/posStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { PaymentMethod } from "../_types/pos.types";
import { alert } from "@/lib/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, DollarSign, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <DialogContent className="sm:max-w-md"></DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Sale</DialogTitle>
          <DialogDescription>
            Select payment method and confirm the sale
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span className="font-medium">{cart.items.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-${cart.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">${cart.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          >
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="CASH" id="cash" />
              <Label
                htmlFor="cash"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Cash
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="CARD" id="card" />
              <Label
                htmlFor="card"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Card
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="MOBILE" id="mobile" />
              <Label
                htmlFor="mobile"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Mobile Payment
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="OTHER" id="other" />
              <Label
                htmlFor="other"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Other
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default CheckoutPanel;
