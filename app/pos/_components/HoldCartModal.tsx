"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PauseCircle, Tag } from "lucide-react";
import { usePOSStore } from "@/store/posStore";
import { alert } from "@/lib/alert";

interface HoldCartModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HoldCartModal({ open, onClose }: HoldCartModalProps) {
  const { holdCart, cart, customerName } = usePOSStore();
  const [note, setNote] = useState("");

  const handleConfirmHold = () => {
    if (cart.items.length === 0) {
      alert.error("Cart Empty", "Cannot hold an empty cart");
      return;
    }

    const holdNumber = holdCart(note);
    if (holdNumber) {
      alert.success(
        `Sale Parked (${holdNumber})`,
        `Cart saved. You can now serve the next customer.`
      );
      setNote("");
      onClose();
    } else {
      alert.error("Hold Failed", "Failed to park sale");
    }
  };

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
              <PauseCircle className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Hold / Park Transaction</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Temporarily store this cart to process another customer
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Cart Summary Card */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-xs space-y-1">
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
              <span>Customer:</span>
              <span className="font-semibold">{customerName || "Walk-in Customer"}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
              <span>Items in Cart:</span>
              <span>{totalItems} items ({cart.items.length} unique)</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold text-sm pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Cart Total:</span>
              <span className="text-primary">Rs. {cart.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <Label htmlFor="hold-note" className="text-xs font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Optional Note / Reference
            </Label>
            <Input
              id="hold-note"
              placeholder="e.g. Getting cement bags, Phone order, Call back..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmHold();
              }}
              autoFocus
              className="text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Helps identify this cart when resuming later.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmHold}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
          >
            <PauseCircle className="w-4 h-4 mr-1.5" />
            Park Sale Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
