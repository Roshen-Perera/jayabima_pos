import { usePOSStore } from "@/store/posStore";
import { useAuthStore } from "@/store/useAuthStore";
import React, { useState } from "react";
import { PaymentMethod, Sale } from "../_types/pos.types";
import { alert } from "@/lib/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  DollarSign,
  Loader2,
  Smartphone,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerStore } from "@/store/customerStore";
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Separator, Select } from "radix-ui";

interface CheckoutPanelProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (saleId: string) => void;
}

const CheckoutPanel = ({ open, onClose, onSuccess }: CheckoutPanelProps) => {
  const { user } = useAuthStore();
  const { customers } = useCustomerStore();
  const { cart, customerId, customerName, setCustomer, clearCart } =
    usePOSStore();
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
      const sale: Sale = {
        id: "SAL-" + Date.now().toString(),
        items: cart.items,
        customerId,
        customerName,
        subtotal: cart.subtotal,
        discount: cart.discount,
        total: cart.total,
        paymentMethod,
        status: "COMPLETED",
        createdAt: new Date(),
        userId: user.id,
        userName: user.name,
      };

      await new Promise((resolve) => setTimeout(resolve, 800));

      alert.success(
        "Sale completed!",
        `Rs. ${cart.total.toLocaleString()} received via ${paymentMethod}`,
      );

      clearCart();
      onSuccess(sale.id);
      onClose();
    } catch (error) {
      console.error("Checkout error:", error);
      alert.error("Checkout failed", "An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomerSelect = (value: string) => {
    if (value === "walk-in") {
      setCustomer(undefined, undefined);
    } else {
      const customer = customers.find((c) => c.id === value);
      if (customer) {
        setCustomer(customer.id, customer.name);
      }
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
        <div className="space-y-4">
          {/* Sale Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Order Summary</p>

            {/* Items */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rs. {cart.subtotal.toLocaleString()}</span>
            </div>

            {cart.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>- Rs. {cart.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span className="text-primary">
                Rs. {cart.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer
            </Label>
            <Select
              value={customerId || "walk-in"}
              onValueChange={handleCustomerSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {/* Walk-in option */}
                <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                <Separator className="my-1" />
                {/* Customer list */}
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {customer.phone}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
              className="grid grid-cols-2 gap-2"
            >
              {/* Cash */}
              <div
                className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors ${
                  paymentMethod === "CASH" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value="CASH" id="cash" />
                <Label
                  htmlFor="cash"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <DollarSign className="h-4 w-4" />
                  Cash
                </Label>
              </div>

              {/* Card */}
              <div
                className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors ${
                  paymentMethod === "CARD" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value="CARD" id="card" />
                <Label
                  htmlFor="card"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  Card
                </Label>
              </div>

              {/* Mobile */}
              <div
                className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors ${
                  paymentMethod === "MOBILE"
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
              >
                <RadioGroupItem value="MOBILE" id="mobile" />
                <Label
                  htmlFor="mobile"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </Label>
              </div>

              {/* Other */}
              <div
                className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors ${
                  paymentMethod === "OTHER" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value="OTHER" id="other" />
                <Label
                  htmlFor="other"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Wallet className="h-4 w-4" />
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Complete - Rs. ${cart.total.toLocaleString()}`
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CheckoutPanel;
