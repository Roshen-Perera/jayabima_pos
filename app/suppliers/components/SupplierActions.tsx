import React from "react";
import { Supplier } from "../types/supplier.types";
import { useSupplierStore } from "@/store/supplierStore";

interface SupplierActionsProps {
  supplier: Supplier;
}

const SupplierActions = ({ supplier }: SupplierActionsProps) => {
  const deleteSupplier = useSupplierStore((state) => state.deleteSupplier);
  return <div>SupplierActions</div>;
};

export default SupplierActions;
