import { useSupplierStore } from "@/store/supplierStore";
import { Supplier } from "../types/supplier.types";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { SupplierFormData, supplierSchema } from "../lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";

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
  onOpenChange: externalOnOpenChange,
}: SupplierFormProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  const addSupplier = useSupplierStore((state) => state.addSupplier);
  const updateSupplier = useSupplierStore((state) => state.updateSupplier);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    mode: "onChange",
    defaultValues: supplier
      ? {
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          taxId: supplier.taxId || "",
          paymentTerms: supplier.paymentTerms,
          active: supplier.active,
          notes: supplier.notes || "",
        }
      : {
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          taxId: "",
          paymentTerms: "Net 30",
          active: true,
          notes: "",
        },
  });
  return <div>SupplierForm</div>;
};
