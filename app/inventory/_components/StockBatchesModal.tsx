"use client";

import React, { useEffect, useState } from "react";
import { Product, StockBatch } from "../_types/product.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Layers, Loader2, PackageCheck, Truck } from "lucide-react";

interface StockBatchesModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StockBatchesModal: React.FC<StockBatchesModalProps> = ({
  product,
  open,
  onOpenChange,
}) => {
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product || !open) return;

    const fetchBatches = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/inventory/${product.id}/batches`);
        if (res.ok) {
          const data = await res.json();
          setBatches(data);
        }
      } catch (err) {
        console.error("Error loading batches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [product, open]);

  if (!product) return null;

  const totalRemaining = batches.reduce((acc, b) => acc + b.remainingQty, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <DialogTitle>Stock Batches &amp; Cost Breakdown</DialogTitle>
          </div>
          <DialogDescription>
            Cost lots and FIFO queue for <span className="font-semibold text-foreground">{product.name}</span> ({product.sku}).
          </DialogDescription>
        </DialogHeader>

        {/* Product Stock & Cost Summary */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Total Stock:</span>
            <span className="font-bold text-sm text-foreground">{product.stock} units</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Active Batch Units:</span>
            <span className="font-bold text-sm text-primary">{totalRemaining} units</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Current Retail Price:</span>
            <span className="font-bold text-sm text-foreground">Rs. {Number(product.price).toLocaleString()}</span>
          </div>
        </div>

        {/* Batches Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Inventory Lots ({batches.length})
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading batches...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/20 text-xs text-muted-foreground">
              No stock batches found for this product yet.
              <p className="text-[11px] mt-1">Batches are created automatically upon receiving Purchase Orders.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {batches.map((batch, index) => {
                const isDepleted = batch.remainingQty <= 0;
                // Oldest active batch is currently selling
                const activeBatches = batches.filter((b) => b.remainingQty > 0);
                const isCurrentlySelling = activeBatches.length > 0 && activeBatches[activeBatches.length - 1]?.id === batch.id;

                return (
                  <div
                    key={batch.id}
                    className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                      isDepleted
                        ? "bg-muted/20 border-border/50 opacity-65"
                        : isCurrentlySelling
                        ? "bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800 shadow-xs"
                        : "bg-background border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {batch.batchNumber || `Batch #${batch.id.slice(-6)}`}
                          </span>
                          {isCurrentlySelling ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-1.5 py-0">
                              🟢 Selling Now (FIFO)
                            </Badge>
                          ) : !isDepleted ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50">
                              🔵 In Queue
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                              ⚪ Depleted
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Received: {format(new Date(batch.createdAt), "dd MMM yyyy, h:mm a")}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-muted-foreground block">Purchase Cost</span>
                        <span className="font-bold text-foreground text-sm">
                          Rs. {Number(batch.cost).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                      <span className="text-muted-foreground">
                        {batch.purchaseOrder ? (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-muted-foreground" />
                            PO: {batch.purchaseOrder.orderNumber}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <PackageCheck className="w-3 h-3 text-muted-foreground" />
                            Initial / Manual Stock
                          </span>
                        )}
                      </span>

                      <span className="font-medium">
                        Remaining:{" "}
                        <strong className={isDepleted ? "text-muted-foreground" : "text-foreground font-bold"}>
                          {batch.remainingQty}
                        </strong>{" "}
                        / {batch.quantity} units
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
