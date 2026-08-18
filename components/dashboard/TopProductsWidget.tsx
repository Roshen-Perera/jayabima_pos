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
    })
      .format(amount)
      .replace("LKR", "Rs.");
  };

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
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4 w-4 text-orange-500" />
          Top Selling Products
        </CardTitle>
        <CardDescription className="text-xs">
          Popular items by sales volume
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {products.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm flex flex-col items-center">
            <Package className="h-6 w-6 mb-1 opacity-40" />
            No sales items recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {products.map((item, index) => (
              <div key={item.productId || index} className="py-2 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {index + 1}. {item.name}
                </span>
                <span className="text-muted-foreground">
                  {item.totalSold} sold •{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(item.totalRevenue)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
