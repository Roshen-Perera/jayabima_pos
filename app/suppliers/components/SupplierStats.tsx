"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useSupplierStore } from "@/store/supplierStore";
import { Building2, CheckCircle, CreditCard, XCircle } from "lucide-react";
import React from "react";

const SupplierStats = () => {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const stats = React.useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s) => s.active).length;
    const inactiveSuppliers = suppliers.filter((s) => !s.active).length;
    const totalPayable = suppliers.reduce((sum, s) => sum + Number(s.payableBalance || 0), 0);

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalPayable,
    };
  }, [suppliers]);

  const statCards = [
    {
      title: "Total Suppliers",
      value: stats.totalSuppliers.toString(),
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Active Suppliers",
      value: stats.activeSuppliers.toString(),
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Accounts Payable",
      value: `LKR ${stats.totalPayable.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: CreditCard,
      color: "text-amber-600",
    },
    {
      title: "Inactive Suppliers",
      value: stats.inactiveSuppliers.toString(),
      icon: XCircle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-xl font-bold mt-1 tracking-tight">{stat.value}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SupplierStats;
