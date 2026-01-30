import { Supplier } from "../types/supplier.types";

import { useState } from "react";

interface SupplierFormProps {
  supplier?: Supplier;
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupplierForm = ({
  supplier,
  mode,
  open: externalOpen,
  onOpenChange,
}: SupplierFormProps) => {
  const [internalOpen, setInternalOpen] = useState(open);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  return <div>SupplierForm</div>;
};
