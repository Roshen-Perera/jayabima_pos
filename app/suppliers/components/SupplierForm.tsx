import { useSupplierStore } from "@/store/supplierStore";
import { Supplier } from "../types/supplier.types";

import { useEffect, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SupplierFormData, supplierSchema } from "../lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { alert } from "@/lib/alert";

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
          active: supplier.active,
        }
      : {
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          active: true,
        },
  });

  useEffect(() => {
    if (open && supplier) {
      reset({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        active: supplier.active,
      });
    } else if (open && !supplier) {
      reset({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        active: true,
      });
    }
  }, [open, supplier, reset]);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (mode === "edit" && supplier) {
        updateSupplier(supplier.id, data);
        alert.success(
          "Supplier updated!",
          `${data.name} has been updated successfully.`,
        );
      } else {
        addSupplier(data);
        alert.success(
          "Supplier added!",
          `${data.name} has been added successfully.`,
        );
      }

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
      alert.error("Failed to save", "Something went wrong. Please try again.");
    }
  };

  return <div>SupplierForm</div>;
};
