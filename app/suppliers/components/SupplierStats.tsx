import { Card, CardContent, } from "@/components/ui/card";
import { useSupplierStore } from "@/store/supplierStore";
import { Building2, CheckCircle, XCircle } from "lucide-react";
import React from "react";

const SupplierStats = () => {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const stats = React.useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s) => s.active).length;
    const inactiveSuppliers = suppliers.filter((s) => !s.active).length;

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
    };
  }, [suppliers]);

  const statCards = [
    {
      title: "Total Suppliers",
      value: stats.totalSuppliers,
      icon: Building2,
    },
    {
      title: "Active Suppliers",
      value: stats.activeSuppliers,
      icon: CheckCircle,
    },
    {
      title: "Inactive Suppliers",
      value: stats.inactiveSuppliers,
      icon: XCircle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
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
