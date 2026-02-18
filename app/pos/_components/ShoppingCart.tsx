"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart as CartIcon,
  Trash2,
  Tag,
  Package,
  Minus,
  Plus,
  X,
  Percent,
} from "lucide-react";
import { usePOSStore } from "@/store/posStore";
import { useState } from "react";
import { alert } from "@/lib/alert";

interface ShoppingCartProps {
  onCheckout: () => void;
}

export default function ShoppingCart({ onCheckout }: ShoppingCartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, applyDiscount } =
    usePOSStore();

  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState("");
  const [showItemDiscountModal, setShowItemDiscountModal] = useState<
    string | null
  >(null);
  const [showPriceOverrideModal, setShowPriceOverrideModal] = useState<
    string | null
  >(null);

  const isEmpty = cart.items.length === 0;

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity(productId, quantity);
  };

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountValue);
    if (!isNaN(discount) && discount >= 0 && discount <= cart.subtotal) {
      applyDiscount(discount);
      setShowDiscountInput(false);
      setDiscountValue("");
      alert.success("Discount applied", `Rs. ${discount} discount added`);
    } else {
      alert.error("Invalid discount", "Please enter a valid discount amount");
    }
  };

  const handleRemoveDiscount = () => {
    applyDiscount(0);
    setDiscountValue("");
    alert.success("Discount removed", "Discount has been cleared");
  };

  return (
    <Card className="flex flex-col min-w-[320px] max-w-[400px] overflow-hidden h-full border">
      {/* Header */}
      <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Current Sale</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {cart.items.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {cart.items.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearCart}
              className="w-8 h-8 text-muted-foreground hover:text-destructive"
              title="Clear cart"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Cart Items - Scrollable */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-2">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs">Click products to add</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          Rs. {item.price.toLocaleString()}
                        </p>
                        {item.category && (
                          <Badge variant="outline" className="text-[10px]">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 hover:text-destructive"
                        onClick={() => handleRemoveItem(item.productId)}
                        title="Remove item"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity - 1,
                          )
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(
                            item.productId,
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-12 h-7 text-center text-sm px-1"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity + 1,
                          )
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="font-semibold text-sm">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Totals & Payment - Fixed at bottom */}
        {!isEmpty && (
          <div className="flex-shrink-0 border-t border-border bg-card">
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rs. {cart.subtotal.toLocaleString()}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-Rs. {cart.discount.toLocaleString()}</span>
                </div>
              )}

              {/* Discount Button/Input */}
              {showDiscountInput ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter discount (Rs.)"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="h-8 text-sm"
                      min={0}
                      max={cart.subtotal}
                      autoFocus
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyDiscount}
                      className="h-8"
                    >
                      Apply
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7"
                    onClick={() => {
                      setShowDiscountInput(false);
                      setDiscountValue("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground h-8"
                  onClick={() => {
                    if (cart.discount > 0) {
                      handleRemoveDiscount();
                    } else {
                      setShowDiscountInput(true);
                    }
                  }}
                >
                  <Percent className="w-4 h-4 mr-2" />
                  {cart.discount > 0 ? "Remove Discount" : "Add Discount"}
                </Button>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  Rs. {cart.total.toLocaleString()}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full mt-2"
                size="lg"
                onClick={onCheckout}
                disabled={isEmpty}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
