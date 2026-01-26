"use client";

import React from "react";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useProductStore } from "@/store/productStore";

const ProductStats = () => {
  const products = useProductStore((s) => s.products);

  const stats = React.useMemo(() => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(
      (p) => p.stock <= p.minStock,
    ).length;
    const totalStockValue = products.reduce(
      (sum, p) => sum + p.stock * p.cost,
      0,
    );
    const activeProducts = products.filter((p) => p.active).length;

    return {
      totalProducts,
      lowStockProducts,
      totalStockValue,
      activeProducts,
    };
  }, [products]);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      icon: TrendingUp,
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockProducts,
      color: "text-destructive",
      icon: AlertTriangle,
    },
    {
      title: "Stock Value",
      value: `Rs. ${stats.totalStockValue.toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductStats;
