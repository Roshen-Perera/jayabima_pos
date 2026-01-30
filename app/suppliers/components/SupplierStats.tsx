import { useSupplierStore } from "@/store/supplierStore";
import React from "react";

const SupplierStats = () => {
  const suppliers = useSupplierStore((s) => s.suppliers);
  return <div>SupplierStats</div>;
};

export default SupplierStats;
