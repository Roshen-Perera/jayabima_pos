import React from "react";
import { Supplier } from "../types/supplier.types";
import { useSupplierStore } from "@/store/supplierStore";

interface SupplierActionsProps {
  supplier: Supplier;
}

const SupplierActions = ({ supplier }: SupplierActionsProps) => {
  const deleteSupplier = useSupplierStore((state) => state.deleteSupplier);
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  return <div>SupplierActions</div>;
};

export default SupplierActions;
