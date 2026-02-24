"use client";

interface SalesStatsProps {
  stats: {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    averageOrderValue: number;
  };
}
