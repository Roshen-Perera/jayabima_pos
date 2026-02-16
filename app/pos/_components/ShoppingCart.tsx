import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
            {!isEmpty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <CartIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Add products to start a sale
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>
          {!isEmpty && (
            <>
              <Separator className="my-4" />

              <div className="space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ${cart.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Discount (if any) */}
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${cart.discount.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                {/* Total (no tax) */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button className="w-full mt-4" size="lg" onClick={onCheckout}>
                Proceed to Checkout
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingCart;
