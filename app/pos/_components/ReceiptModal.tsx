import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { alert } from "@/lib/alert";
import { DialogContent, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Download, Printer, X } from "lucide-react";
import React from "react";
import { Sale } from "../_types/pos.types";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const ReceiptModal = ({ open, onClose, sale }: ReceiptModalProps) => {
  if (!sale) return null;
  const handlePrint = () => {
    window.print();
  };
  const handleDownload = () => {
    // TODO: Generate PDF receipt
    alert.success("PDF download coming soon!");
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sale Receipt</DialogTitle>
          <DialogDescription>
            Transaction #{sale.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        {/* Receipt Content */}
        <div className="space-y-4" id="receipt">
          {/* Business Info */}
          <div className="text-center">
            <h2 className="text-xl font-bold">JAYABIMA POS</h2>
            <p className="text-sm text-muted-foreground">
              Point of Sale System
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(sale.createdAt).toLocaleString()}
            </p>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            {sale.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${sale.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${sale.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Payment Method:{" "}
              <span className="font-medium">{sale.paymentMethod}</span>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Thank you for your purchase!</p>
            <p className="mt-1">Receipt ID: {sale.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
