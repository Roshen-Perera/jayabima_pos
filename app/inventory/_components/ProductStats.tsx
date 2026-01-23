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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockProducts,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Stock Value",
      value: `Rs. ${stats.totalStockValue.toLocaleString()}`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
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
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
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
