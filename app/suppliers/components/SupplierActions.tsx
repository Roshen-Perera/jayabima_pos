import React from "react";
import { Supplier } from "../types/supplier.types";
import { useSupplierStore } from "@/store/supplierStore";
import { alert } from "@/lib/alert";

interface SupplierActionsProps {
  supplier: Supplier;
}

const SupplierActions = ({ supplier }: SupplierActionsProps) => {
  const deleteSupplier = useSupplierStore((state) => state.deleteSupplier);
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const handleDelete = () => {
    deleteSupplier(supplier.id);
    alert.success("Supplier deleted!", `${supplier.name} has been removed.`);
  };

  return <div>SupplierActions</div>;
};

export default SupplierActions;
