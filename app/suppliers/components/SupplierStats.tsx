import { useSupplierStore } from "@/store/supplierStore";
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

  return <div>SupplierStats</div>;
};

export default SupplierStats;
