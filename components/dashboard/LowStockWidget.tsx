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
      <Card className="animate-pulse">
        <CardContent className="p-4 space-y-3">
          <div className="h-4 w-32 bg-muted rounded"></div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-full bg-muted/40 rounded"></div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription className="text-xs">
            Items at or below minimum threshold
          </CardDescription>
        </div>
        <Link
          href="/inventory"
          className="text-xs font-medium text-amber-500 hover:underline flex items-center gap-1"
        >
          Manage <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {items.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm flex flex-col items-center">
            <PackageCheck className="h-6 w-6 text-emerald-500 mb-1" />
            Stock levels are healthy.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => {
              const isOut = item.stock <= 0;

              return (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      SKU: {item.sku} • {item.category}
                    </p>
                  </div>
                  <Badge
                    variant={isOut ? "destructive" : "outline"}
                    className={
                      isOut
                        ? ""
                        : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400"
                    }
                  >
                    {isOut ? "Out of Stock" : `${item.stock} / ${item.minStock}`}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
