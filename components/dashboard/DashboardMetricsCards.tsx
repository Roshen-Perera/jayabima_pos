"use client";

import React from "react";
import { Banknote, Users, Truck, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryData {
  todayRevenue: number;
  todaySalesCount: number;
  totalReceivables: number;
  totalPayables: number;
  totalCustomersCount: number;
  totalSuppliersCount: number;
  totalProductsCount: number;
  lowStockCount: number;
}

interface DashboardMetricsCardsProps {
  summary: SummaryData;
  isLoading?: boolean;
}

export function DashboardMetricsCards({
  summary,
  isLoading,
}: DashboardMetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace("LKR", "Rs.");
  };

  const cards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(summary.todayRevenue),
      subtext: `${summary.todaySalesCount} sales today`,
      icon: Banknote,
      iconColor: "text-emerald-500",
      textColor: "text-foreground",
    },
    {
      title: "Customer Receivables",
      value: formatCurrency(summary.totalReceivables),
      subtext: `${summary.totalCustomersCount} active customers`,
      icon: Users,
      iconColor: "text-blue-500",
      textColor: "text-foreground",
    },
    {
      title: "Supplier Payables",
      value: formatCurrency(summary.totalPayables),
      subtext: `${summary.totalSuppliersCount} active suppliers`,
      icon: Truck,
      iconColor: "text-purple-500",
      textColor: "text-foreground",
    },
    {
      title: "Low Stock Alerts",
      value: `${summary.lowStockCount}`,
      subtext: summary.lowStockCount > 0 ? "Items require restock" : "Stock healthy",
      icon: AlertTriangle,
      iconColor: summary.lowStockCount > 0 ? "text-destructive" : "text-muted-foreground",
      textColor: summary.lowStockCount > 0 ? "text-destructive" : "text-foreground",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-7 w-32 bg-muted rounded"></div>
              <div className="h-3 w-28 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.subtext}</p>
              </div>
              <div className="p-2 rounded-md bg-muted/50">
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
