"use client";

interface SalesStatsProps {
  stats: {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    averageOrderValue: number;
  };
}

export default function SalesStats({ stats }: SalesStatsProps) {}
