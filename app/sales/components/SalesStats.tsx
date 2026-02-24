"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

interface SalesStatsProps {
  stats: {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    averageOrderValue: number;
  };
}

export default function SalesStats({ stats }: SalesStatsProps) {
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.totalSales}</div>
        <p className="text-xs text-muted-foreground mt-1">Transactions today</p>
      </CardContent>
    </Card>
  </div>;
}
