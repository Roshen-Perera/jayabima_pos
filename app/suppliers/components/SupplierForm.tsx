"use client"

import { useSupplierStore } from "@/store/supplierStore";
import { Supplier } from "../types/supplier.types";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SupplierFormData, supplierSchema } from "../lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { alert } from "@/lib/alert";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Switch } from "@radix-ui/react-switch";
import { Plus } from "lucide-react";

interface SupplierFormProps {
  supplier?: Supplier;
  mode: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SupplierForm = ({
  supplier,
  mode,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: SupplierFormProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

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

  const active = watch("active");

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        {mode === "add" && (
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="gap-2"
              onClick={() => setOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="sm:max-w-137.5 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {mode === "edit" ? "Edit Supplier" : "Add Supplier"}
              </DialogTitle>
              <DialogDescription>
                {mode === "edit"
                  ? "Make changes to supplier information."
                  : "Add a new supplier to your list."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Supplier Name</Label>
                <Input
                  id="name"
                  placeholder="Tech Wholesale Ltd"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="John Smith"
                    {...register("contactPerson")}
                    className={errors.contactPerson ? "border-red-500" : ""}
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-red-500">
                      {errors.contactPerson.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@supplier.com"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0771234567"
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Business Park, Colombo"
                  {...register("address")}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Active Supplier</Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive suppliers won&apos;t appear in product forms
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={(checked: boolean) =>
                    setValue("active", checked)
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save changes"
                    : "Add Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
