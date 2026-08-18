"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingCart, FileText } from "lucide-react";

interface RecentSale {
  id: string;
  customerName: string;
  cashierName: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

interface RecentSalesWidgetProps {
  sales: RecentSale[];
  isLoading?: boolean;
}

export function RecentSalesWidget({ sales, isLoading }: RecentSalesWidgetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
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
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-orange-500" />
            Recent Transactions
          </CardTitle>
          <CardDescription className="text-xs">
            Latest completed POS sales
          </CardDescription>
        </div>
        <Link
          href="/sales"
          className="text-xs font-medium text-orange-500 hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {sales.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm flex flex-col items-center">
            <FileText className="h-6 w-6 mb-1 opacity-40" />
            No recent sales recorded today.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="py-2 flex items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {sale.customerName}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                      {sale.paymentMethod}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Cashier: {sale.cashierName} •{" "}
                    {format(new Date(sale.createdAt), "hh:mm a")}
                  </div>
                </div>
                <div className="font-bold text-foreground">
                  {formatCurrency(sale.total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
