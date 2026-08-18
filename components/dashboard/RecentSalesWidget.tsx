"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingCart, CreditCard, Banknote, Landmark, FileText } from "lucide-react";

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

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "CASH":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
            <Banknote className="h-3 w-3 mr-1" /> Cash
          </Badge>
        );
      case "CARD":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 font-medium">
            <CreditCard className="h-3 w-3 mr-1" /> Card
          </Badge>
        );
      case "BANK_TRANSFER":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 font-medium">
            <Landmark className="h-3 w-3 mr-1" /> Transfer
          </Badge>
        );
      case "CREDIT":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 font-medium">
            Credit
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 font-medium">
            {method}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="h-5 w-36 bg-muted rounded"></div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-muted/40 rounded-lg"></div>
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
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-orange-500" />
            Recent Transactions
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Latest completed POS sales
          </CardDescription>
        </div>
        <Link
          href="/sales"
          className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 hover:underline"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {sales.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No recent sales recorded yet today.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-md transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {sale.customerName}
                    </span>
                    {getMethodBadge(sale.paymentMethod)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cashier: {sale.cashierName} •{" "}
                    {format(new Date(sale.createdAt), "hh:mm a")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">
                    {formatCurrency(sale.total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
