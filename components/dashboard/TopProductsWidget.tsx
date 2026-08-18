"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Package } from "lucide-react";

interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

interface TopProductsWidgetProps {
  products: TopProduct[];
  isLoading?: boolean;
}

export function TopProductsWidget({ products, isLoading }: TopProductsWidgetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("LKR", "Rs.");
  };

  const maxSold = Math.max(...products.map((p) => p.totalSold), 1);

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
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4 w-4 text-orange-500" />
          Top Selling Products
        </CardTitle>
        <CardDescription className="text-xs mt-0.5">
          Most popular hardware items by volume
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {products.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
            No sales items recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((item, index) => {
              const widthRatio = (item.totalSold / maxSold) * 100;

              return (
                <div key={item.productId || index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[200px]">
                      {index + 1}. {item.name}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {item.totalSold} units •{" "}
                      <span className="text-foreground font-bold">
                        {formatCurrency(item.totalRevenue)}
                      </span>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(widthRatio, 5)}%` }}
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
