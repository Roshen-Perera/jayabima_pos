import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { alert } from "@/lib/alert";
import { Printer, ShoppingBag } from "lucide-react";
import React from "react";
import { Sale } from "../_types/pos.types";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const ReceiptModal = ({ open, onClose, sale }: ReceiptModalProps) => {
  if (!sale) return null;

  const handlePrint = () => window.print();
  const handleDownload = () => alert.success("PDF download coming soon!");

  // Derived totals from sale
  const originalTotal =
    sale.originalTotal ??
    sale.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const totalItemDiscount =
    sale.itemDiscount ??
    sale.items.reduce(
      (sum, i) => sum + (i.price - (i.overridePrice ?? i.price)) * i.quantity,
      0,
    );

  const totalSavings =
    sale.totalSavings ?? totalItemDiscount + (sale.discount ?? 0);

  const savingsPct =
    originalTotal > 0 ? ((totalSavings / originalTotal) * 100).toFixed(1) : "0";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-600" />
            Sale Completed!
          </DialogTitle>
        </DialogHeader>

        {/* Receipt */}
        <div className="space-y-3 font-mono text-sm" id="receipt-content">
          {/* Store Header */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold">JAYABIMA</h2>
            <p className="text-xs text-muted-foreground">
              Hardware & Construction Supplies
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(sale.createdAt).toLocaleString("en-LK")}
            </p>
            <p className="text-xs text-muted-foreground">
              Receipt #{sale.id.slice(-8).toUpperCase()}
            </p>
          </div>

          <Separator />

          {/* Customer */}
          {sale.customerName && (
            <>
              <div className="text-xs">
                <span className="text-muted-foreground">Customer: </span>
                <span className="font-medium">{sale.customerName}</span>
              </div>
              <Separator />
            </>
          )}

          {/* Items */}
          <div className="space-y-2">
            {sale.items.map((item, index) => {
              const effectivePrice = item.overridePrice ?? item.price;
              const itemOriginalTotal = item.price * item.quantity;
              const itemEffectiveTotal = effectivePrice * item.quantity;
              const itemSavings = itemOriginalTotal - itemEffectiveTotal;
              const isOverridden = item.overridePrice !== undefined;

              return (
                <div key={index}>
                  <p className="font-medium text-xs leading-tight">
                    {item.name}
                  </p>

                  {/* Unit price line */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {item.quantity} ×{" "}
                      {isOverridden ? (
                        <>
                          <span className="line-through">
                            Rs. {item.price.toLocaleString()}
                          </span>{" "}
                          <span className="text-amber-600">
                            Rs. {effectivePrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <>Rs. {item.price.toLocaleString()}</>
                      )}
                    </span>
                    <div className="text-right">
                      {isOverridden && (
                        <p className="line-through text-[10px]">
                          Rs. {itemOriginalTotal.toLocaleString()}
                        </p>
                      )}
                      <span className="font-medium text-foreground">
                        Rs. {itemEffectiveTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Per-item savings */}
                  {itemSavings > 0 && (
                    <div className="flex justify-between text-[10px] text-green-600 mt-0.5">
                      <span>
                        Discount (
                        {((itemSavings / itemOriginalTotal) * 100).toFixed(1)}%)
                      </span>
                      <span>-Rs. {itemSavings.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Total</span>
              <span>Rs. {originalTotal.toLocaleString()}</span>
            </div>

            {totalItemDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Item Discounts</span>
                <span>-Rs. {totalItemDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rs. {sale.subtotal.toLocaleString()}</span>
            </div>

            {sale.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Cart Discount</span>
                <span>-Rs. {sale.discount.toLocaleString()}</span>
              </div>
            )}

            {/* Total savings highlight */}
            {totalSavings > 0 && (
              <div className="flex justify-between text-green-600 border border-green-200 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded mt-1">
                <span className="font-medium">Total Savings</span>
                <span className="font-medium">
                  Rs. {totalSavings.toLocaleString()} ({savingsPct}% off)
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-base pt-1">
              <span>TOTAL</span>
              <span>Rs. {sale.total.toLocaleString()}</span>
            </div>
          </div>

          <Separator />

          {/* Payment */}
          <div className="text-xs text-center space-y-1">
            <p>
              <span className="text-muted-foreground">Payment: </span>
              <span className="font-medium">{sale.paymentMethod}</span>
            </p>
            {sale.userName && (
              <p>
                <span className="text-muted-foreground">Served by: </span>
                <span className="font-medium">{sale.userName}</span>
              </p>
            )}
            <p className="text-muted-foreground mt-2">
              Thank you for your purchase!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button className="flex-1" onClick={onClose}>
            New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
