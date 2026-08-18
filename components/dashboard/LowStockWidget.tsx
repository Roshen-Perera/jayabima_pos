"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PackageCheck, AlertTriangle } from "lucide-react";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
}

interface LowStockWidgetProps {
  items: LowStockItem[];
  isLoading?: boolean;
}

export function LowStockWidget({ items, isLoading }: LowStockWidgetProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="h-5 w-36 bg-muted rounded"></div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full bg-muted/40 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Items at or below reorder threshold
          </CardDescription>
        </div>
        <Link
          href="/inventory"
          className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline"
        >
          Manage Stock <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {items.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center">
            <PackageCheck className="h-8 w-8 text-emerald-500 mb-2 opacity-80" />
            <p className="font-medium text-foreground">Stock Healthy</p>
            <p className="text-xs text-muted-foreground">
              All inventory items are currently above minimum stock levels.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => {
              const isOut = item.stock <= 0;
              const ratio = Math.min(100, Math.max(0, (item.stock / Math.max(item.minStock, 1)) * 100));

              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 font-normal">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        SKU: {item.sku}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={isOut ? "destructive" : "outline"}
                        className={
                          isOut
                            ? ""
                            : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400"
                        }
                      >
                        {isOut ? "Out of Stock" : `${item.stock} / ${item.minStock} min`}
                      </Badge>
                    </div>
                  </div>

                  {/* Stock ratio progress bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOut ? "bg-red-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
