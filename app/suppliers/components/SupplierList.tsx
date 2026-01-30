import { useSupplierStore } from "@/store/supplierStore";
import React from "react";

const SupplierList = () => {
  const suppliers = useSupplierStore((s) => s.suppliers);
  return <div>SupplierList</div>;
};

export default SupplierList;
