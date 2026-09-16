"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/card";
import { Dialog as BaseDialog, DialogContent as BaseDialogContent, DialogHeader as BaseDialogHeader, DialogTitle as BaseDialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Play, Trash2, User, Package, FileText, PauseCircle } from "lucide-react";
import { usePOSStore } from "@/store/posStore";
import { HeldTransaction } from "../_types/pos.types";
import { alert } from "@/lib/alert";

interface HeldTransactionsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HeldTransactionsModal({
  open,
  onClose,
}: HeldTransactionsModalProps) {
  const { heldTransactions, resumeHeldTransaction, deleteHeldTransaction, cart } =
    usePOSStore();

  const handleResume = (held: HeldTransaction) => {
    // If cart currently has items, check with user or auto-hold current cart
    if (cart.items.length > 0) {
      if (
        !confirm(
          "Your active cart is not empty. Resuming this held sale will replace your current cart. Continue?"
        )
      ) {
        return;
      }
    }

    const success = resumeHeldTransaction(held.id);
    if (success) {
      alert.success(
        `Resumed ${held.holdNumber}`,
        `Loaded ${held.cart.items.reduce((acc, item) => acc + item.quantity, 0)} items into cart`
      );
      onClose();
    } else {
      alert.error("Error", "Could not resume held transaction");
    }
  };

  const handleDelete = (held: HeldTransaction) => {
    if (confirm(`Are you sure you want to discard held sale ${held.holdNumber}?`)) {
      deleteHeldTransaction(held.id);
      alert.info("Discarded", `Held transaction ${held.holdNumber} deleted`);
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={onClose}>
      <BaseDialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <BaseDialogHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600">
                <PauseCircle className="w-5 h-5" />
              </div>
              <div>
                <BaseDialogTitle className="text-xl font-bold flex items-center gap-2">
                  Held Transactions
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {heldTransactions.length} Parked
                  </Badge>
                </BaseDialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Resume parked customer carts or discard old holds
                </p>
              </div>
            </div>
          </div>
        </BaseDialogHeader>

        {heldTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground">
              <PauseCircle className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              No Held Transactions
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When a customer needs to pause their checkout, click the "Hold Sale" button in the cart to park it here.
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-3 -mr-3 my-2">
            <div className="space-y-3 py-1">
              {heldTransactions.map((held) => {
                const totalItems = held.cart.items.reduce(
                  (sum, i) => sum + i.quantity,
                  0
                );

                return (
                  <div
                    key={held.id}
                    className="p-4 rounded-xl border bg-card hover:border-amber-400/50 transition-all shadow-sm space-y-3"
                  >
                    {/* Header: Hold Number + Time + Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2.5 py-0.5">
                          {held.holdNumber}
                        </Badge>
                        <span className="flex items-center text-xs text-muted-foreground gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeAgo(held.createdAt)} (
                          {new Date(held.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          )
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(held)}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Discard hold"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Discard
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResume(held)}
                          className="h-8 bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                          Resume Cart
                        </Button>
                      </div>
                    </div>

                    {/* Customer & Note Info */}
                    <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {held.customerName || "Walk-in Customer"}
                      </span>
                      {held.note && (
                        <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                          Note: {held.note}
                        </span>
                      )}
                    </div>

                    {/* Items Summary & Total Price */}
                    <div className="pt-2 border-t flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Package className="w-3.5 h-3.5" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {totalItems} {totalItems === 1 ? "item" : "items"}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[280px]">
                          {held.cart.items
                            .map((i) => `${i.name} (x${i.quantity})`)
                            .join(", ")}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-muted-foreground mr-1">Total:</span>
                        <span className="font-bold text-sm text-primary">
                          Rs. {held.cart.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </BaseDialogContent>
    </BaseDialog>
  );
}
