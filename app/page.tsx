"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { DashboardMetricsCards } from "@/components/dashboard/DashboardMetricsCards";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import { RecentSalesWidget } from "@/components/dashboard/RecentSalesWidget";
import { LowStockWidget } from "@/components/dashboard/LowStockWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { TopProductsWidget } from "@/components/dashboard/TopProductsWidget";
import { toast } from "sonner";

interface DashboardData {
  summary: {
    todayRevenue: number;
    todaySalesCount: number;
    totalReceivables: number;
    totalPayables: number;
    totalCustomersCount: number;
    totalSuppliersCount: number;
    totalProductsCount: number;
    lowStockCount: number;
  };
  salesTrend: Array<{
    dateStr: string;
    label: string;
    revenue: number;
    count: number;
  }>;
  topLowStock: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    minStock: number;
    price: number;
  }>;
  recentSales: Array<{
    id: string;
    customerName: string;
    cashierName: string;
    total: number;
    paymentMethod: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
}

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) {
        throw new Error("Failed to load dashboard metrics");
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (isManualRefresh) {
          toast.success("Dashboard refreshed");
        }
      } else {
        throw new Error(json.error || "Failed to load dashboard");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not refresh dashboard metrics");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const defaultSummary = {
    todayRevenue: 0,
    todaySalesCount: 0,
    totalReceivables: 0,
    totalPayables: 0,
    totalCustomersCount: 0,
    totalSuppliersCount: 0,
    totalProductsCount: 0,
    lowStockCount: 0,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""} • Real-time sales & store metrics overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            disabled={isLoading || isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin text-orange-500" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardMetricsCards
        summary={data?.summary || defaultSummary}
        isLoading={isLoading}
      />

      {/* Quick Navigation Pills */}
      <QuickActionsWidget />

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <SalesTrendChart
            trend={data?.salesTrend || []}
            isLoading={isLoading}
          />
          <RecentSalesWidget
            sales={data?.recentSales || []}
            isLoading={isLoading}
          />
        </div>

        <div className="flex flex-col gap-4">
          <LowStockWidget
            items={data?.topLowStock || []}
            isLoading={isLoading}
          />
          <TopProductsWidget
            products={data?.topProducts || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
