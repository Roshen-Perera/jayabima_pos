import { Supplier } from "../types/supplier.types";

import React from "react";

interface SupplierFormProps {
  supplier?: Supplier;
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupplierForm = () => {
  return <div>SupplierForm</div>;
};
