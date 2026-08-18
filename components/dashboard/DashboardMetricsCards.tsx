"use client";

import React from "react";
import {
  Banknote,
  Users,
  Truck,
  AlertTriangle,
} from "lucide-react";
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
      subtext: `${summary.todaySalesCount} completed ${
        summary.todaySalesCount === 1 ? "sale" : "sales"
      } today`,
      icon: Banknote,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
      borderColor: "border-l-4 border-l-emerald-500",
    },
    {
      title: "Customer Receivables",
      value: formatCurrency(summary.totalReceivables),
      subtext: `Across ${summary.totalCustomersCount} active customers`,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
      borderColor: "border-l-4 border-l-blue-500",
    },
    {
      title: "Supplier Payables",
      value: formatCurrency(summary.totalPayables),
      subtext: `Across ${summary.totalSuppliersCount} active suppliers`,
      icon: Truck,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
      borderColor: "border-l-4 border-l-purple-500",
    },
    {
      title: "Low Stock Alerts",
      value: `${summary.lowStockCount} ${
        summary.lowStockCount === 1 ? "Item" : "Items"
      }`,
      subtext: summary.lowStockCount > 0 ? "Requires restock" : "All stock levels healthy",
      icon: AlertTriangle,
      color:
        summary.lowStockCount > 0
          ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse"
          : "text-slate-600 bg-slate-50 dark:bg-slate-900/40 dark:text-slate-400",
      borderColor:
        summary.lowStockCount > 0
          ? "border-l-4 border-l-amber-500"
          : "border-l-4 border-l-slate-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse shadow-sm border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-7 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-28 bg-muted rounded"></div>
                </div>
                <div className="h-10 w-10 bg-muted rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`shadow-sm hover:shadow-md transition-shadow bg-card border ${card.borderColor}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </h3>
                  <p className="text-xs text-muted-foreground">{card.subtext}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
