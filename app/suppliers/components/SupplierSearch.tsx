import { useSupplierStore } from "@/store/supplierStore";
import React from "react";

const SupplierSearch = () => {
  const search = useSupplierStore((s) => s.search);
  const setSearch = useSupplierStore((s) => s.setSearch);

  return <div>SupplierSearch</div>;
};

export default SupplierSearch;
