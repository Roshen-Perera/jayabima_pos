import { useSupplierStore } from "@/store/supplierStore";
import { Building2, CheckCircle, TrendingUp, XCircle } from "lucide-react";
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

  return <div>SupplierStats</div>;
};

export default SupplierStats;
