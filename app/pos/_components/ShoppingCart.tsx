"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  Package,
  Minus,
  Plus,
  X,
  Percent,
  PencilLine,
  Check,
  RotateCcw,
  Tag,
} from "lucide-react";
import { usePOSStore } from "@/store/posStore";
import { useState } from "react";
import { alert } from "@/lib/alert";

interface ShoppingCartProps {
  onCheckout: () => void;
}

type EditMode = "price" | "discount" | null;

interface ItemEditState {
  mode: EditMode;
  input: string;
}

export default function ShoppingCart({ onCheckout }: ShoppingCartProps) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    updateItemPrice,
  } = usePOSStore();

  const [showCartDiscountInput, setShowCartDiscountInput] = useState(false);
  const [cartDiscountValue, setCartDiscountValue] = useState("");

  // Per-item edit state keyed by productId
  const [itemEdits, setItemEdits] = useState<Record<string, ItemEditState>>({});

  const isEmpty = cart.items.length === 0;

  const getEdit = (productId: string): ItemEditState =>
    itemEdits[productId] ?? { mode: null, input: "" };

  const setEdit = (productId: string, patch: Partial<ItemEditState>) =>
    setItemEdits((prev) => ({
      ...prev,
      [productId]: { ...getEdit(productId), ...patch },
    }));

  const closeEdit = (productId: string) =>
    setEdit(productId, { mode: null, input: "" });

  const handleRemoveItem = (productId: string) => removeFromCart(productId);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity(productId, quantity);
  };

  // Cart-level discount
  const handleApplyCartDiscount = () => {
    const discount = parseFloat(cartDiscountValue);
    if (!isNaN(discount) && discount >= 0 && discount <= cart.total + cart.discount) {
      applyDiscount(discount);
      setShowCartDiscountInput(false);
      setCartDiscountValue("");
      alert.success("Discount applied", `Rs. ${discount} cart discount added`);
    } else {
      alert.error("Invalid discount", "Please enter a valid discount amount");
    }
  };

  const handleRemoveCartDiscount = () => {
    applyDiscount(0);
    setCartDiscountValue("");
    alert.success("Discount removed", "Cart discount has been cleared");
  };

  /**
   * Confirm the inline edit for a cart item.
   * Both "price" and "discount" modes ultimately call updateItemPrice:
   *   - price mode   → set overridePrice = entered value
   *   - discount mode → set overridePrice = originalPrice - enteredDiscount
   */
  const handleConfirmItemEdit = (
    productId: string,
    originalPrice: number,
    quantity: number,
  ) => {
    const edit = getEdit(productId);
    const value = parseFloat(edit.input);

    if (isNaN(value) || value < 0) {
      alert.error("Invalid value", "Please enter a valid number");
      return;
    }

    if (edit.mode === "price") {
      if (value > originalPrice * quantity) {
        alert.error(
          "Invalid price",
          `Price cannot exceed original Rs. ${originalPrice.toLocaleString()}`,
        );
        return;
      }
      updateItemPrice(productId, value);
      alert.success("Price overridden", `New price set to Rs. ${value}`);
    } else if (edit.mode === "discount") {
      if (value > 100 || value < 0) {
        alert.error("Invalid discount", "Discount must be between 0% and 100%");
        return;
      }
      // Convert percentage to new unit price
      const newUnitPrice = originalPrice * (1 - value / 100);
      updateItemPrice(productId, newUnitPrice);
      alert.success("Discount applied", `${value}% discount applied to item`);
    }

    closeEdit(productId);
  };

  const handleResetItemPrice = (productId: string) => {
    updateItemPrice(productId, undefined);
    closeEdit(productId);
    alert.success("Price reset", "Original price restored");
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
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-2">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs">Click products to add</p>
              </div>
            ) : (
              cart.items.map((item) => {
                const edit = getEdit(item.productId);
                const originalPrice = item.price; // untouched inventory price
                const effectivePrice = item.overridePrice ?? originalPrice;
                const isOverridden = item.overridePrice !== undefined;

                // Derived values shown in UI
                const itemOriginalTotal = originalPrice * item.quantity;
                const itemEffectiveTotal = effectivePrice * item.quantity;
                const itemSavings = itemOriginalTotal - itemEffectiveTotal;
                const discountPct =
                  itemSavings > 0
                    ? ((itemSavings / itemOriginalTotal) * 100).toFixed(1)
                    : null;

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors space-y-2"
                  >
                    {/* Row 1: Name + remove */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {/* Original price (always shown) */}
                          <span
                            className={`text-xs ${isOverridden ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
                          >
                            Rs. {originalPrice.toLocaleString()}
                          </span>

                          {/* Effective / override price */}
                          {isOverridden && (
                            <span className="text-xs font-medium text-amber-600">
                              Rs. {effectivePrice.toLocaleString()}
                            </span>
                          )}

                          {item.category && (
                            <Badge variant="outline" className="text-[10px]">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 hover:text-destructive flex-shrink-0"
                        onClick={() => handleRemoveItem(item.productId)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Row 2: Quantity + totals */}
                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
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

                      {/* Totals */}
                      <div className="text-right">
                        {isOverridden && (
                          <p className="text-xs text-muted-foreground line-through">
                            Rs. {itemOriginalTotal.toLocaleString()}
                          </p>
                        )}
                        <p className="font-semibold text-sm">
                          Rs. {itemEffectiveTotal.toLocaleString()}
                        </p>
                        {/* Savings summary */}
                        {itemSavings > 0 && (
                          <p className="text-[10px] text-green-600">
                            Save Rs. {itemSavings.toLocaleString()} (
                            {discountPct}%)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Action buttons */}
                    {edit.mode === null && (
                      <div className="flex items-center gap-1 pt-1 border-t border-border/50">
                        {/* Override price button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2 text-muted-foreground hover:text-amber-600 flex items-center gap-1"
                          onClick={() =>
                            setEdit(item.productId, {
                              mode: "price",
                              input: String(itemEffectiveTotal), // pre-fill with current total
                            })
                          }
                        >
                          <PencilLine className="w-3 h-3" />
                          Set Price
                        </Button>

                        {/* Discount button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2 text-muted-foreground hover:text-green-600 flex items-center gap-1"
                          onClick={() =>
                            setEdit(item.productId, {
                              mode: "discount",
                              input: isOverridden
                                ? String(itemSavings) // pre-fill current discount
                                : "",
                            })
                          }
                        >
                          <Tag className="w-3 h-3" />
                          Discount
                        </Button>

                        {/* Reset — only shown when overridden */}
                        {isOverridden && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2 text-muted-foreground hover:text-destructive flex items-center gap-1 ml-auto"
                            onClick={() => handleResetItemPrice(item.productId)}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Inline edit input — shared for both modes */}
                    {edit.mode !== null && (
                      <div className="pt-1 border-t border-border/50 space-y-1">
                        {/* Label + live preview */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {edit.mode === "price"
                              ? "New total price (Rs.)"
                              : "Discount percentage (%)"}
                          </span>
                          {/* Live derived preview */}
                          {edit.input !== "" &&
                            !isNaN(parseFloat(edit.input)) && (
                              <span className="text-xs font-medium">
                                {edit.mode === "price"
                                  ? itemOriginalTotal - parseFloat(edit.input) >
                                    0
                                    ? `Save Rs. ${(itemOriginalTotal - parseFloat(edit.input)).toLocaleString()}`
                                    : ""
                                  : parseFloat(edit.input) <= 100
                                    ? `Final: Rs. ${(itemOriginalTotal * (1 - parseFloat(edit.input) / 100)).toLocaleString()}`
                                    : ""}
                              </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">
                            {edit.mode === "price" ? "Rs." : "%"}
                          </span>
                          <Input
                            type="number"
                            placeholder={
                              edit.mode === "price"
                                ? `Max ${itemOriginalTotal}`
                                : "0 - 100"
                            }
                            value={edit.input}
                            onChange={(e) =>
                              setEdit(item.productId, { input: e.target.value })
                            }
                            className="h-7 text-sm flex-1"
                            min={0}
                            max={
                              edit.mode === "price" ? itemOriginalTotal : 100
                            }
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleConfirmItemEdit(
                                  item.productId,
                                  originalPrice,
                                  item.quantity,
                                );
                              if (e.key === "Escape") closeEdit(item.productId);
                            }}
                          />
                          <Button
                            size="icon"
                            className="w-7 h-7"
                            onClick={() =>
                              handleConfirmItemEdit(
                                item.productId,
                                originalPrice,
                                item.quantity,
                              )
                            }
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7"
                            onClick={() => closeEdit(item.productId)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Totals & Payment */}
        {!isEmpty && (
          <div className="flex-shrink-0 border-t border-border bg-card">
            <div className="p-4 space-y-2">
              {/* Original total before any discounts */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Total</span>
                <span>
                  Rs.{" "}
                  {cart.items
                    .reduce((sum, i) => sum + i.price * i.quantity, 0)
                    .toLocaleString()}
                </span>
              </div>

              {/* Item-level discounts (price overrides) */}
              {cart.items.some((i) => i.overridePrice !== undefined) &&
                (() => {
                  const totalItemDiscount = cart.items.reduce((sum, i) => {
                    return (
                      sum +
                      (i.price - (i.overridePrice ?? i.price)) * i.quantity
                    );
                  }, 0);
                  const totalOriginal = cart.items.reduce(
                    (sum, i) => sum + i.price * i.quantity,
                    0,
                  );
                  const discountPct = (
                    (totalItemDiscount / totalOriginal) *
                    100
                  ).toFixed(1);

                  return totalItemDiscount > 0 ? (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        Item Discounts
                        <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">
                          -{discountPct}%
                        </span>
                      </span>
                      <span>-Rs. {totalItemDiscount.toLocaleString()}</span>
                    </div>
                  ) : null;
                })()}

              {/* Cart-level discount */}
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Cart Discount</span>
                  <span>-Rs. {cart.discount.toLocaleString()}</span>
                </div>
              )}

              {/* Add Cart Discount button/input */}
              {showCartDiscountInput ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter discount (Rs.)"
                      value={cartDiscountValue}
                      onChange={(e) => setCartDiscountValue(e.target.value)}
                      className="h-8 text-sm"
                      min={0}
                      max={cart.total + cart.discount}
                      autoFocus
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCartDiscount}
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
                      setShowCartDiscountInput(false);
                      setCartDiscountValue("");
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
                      handleRemoveCartDiscount();
                    } else {
                      setShowCartDiscountInput(true);
                    }
                  }}
                >
                  <Percent className="w-4 h-4 mr-2" />
                  {cart.discount > 0
                    ? "Remove Cart Discount"
                    : "Add Cart Discount"}
                </Button>
              )}

              <Separator />

              {/* Total savings summary */}
              {(() => {
                const totalOriginal = cart.items.reduce(
                  (sum, i) => sum + i.price * i.quantity,
                  0,
                );
                const totalSavings =
                  totalOriginal - cart.total;
                const savingsPct = (
                  (totalSavings / totalOriginal) *
                  100
                ).toFixed(1);

                return totalSavings > 0 ? (
                  <div className="flex justify-between text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1.5 rounded-md">
                    <span className="font-medium">Total Savings</span>
                    <span className="font-medium">
                      Rs. {totalSavings.toLocaleString()} ({savingsPct}% off)
                    </span>
                  </div>
                ) : null;
              })()}

              {/* Grand Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  Rs. {cart.total.toLocaleString()}
                </span>
              </div>

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
