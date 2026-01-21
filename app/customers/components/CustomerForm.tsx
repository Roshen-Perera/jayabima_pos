"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { CustomerFormData, customerSchema } from "../lib/validation";
import { useCustomerStore } from "@/store/customerStore";
import { Customer } from "../types/customer.types";

interface CustomerFormProps {
  customer?: Customer; // Optional - if provided, we're editing
  mode: "add" | "edit";
  open?: boolean; // Add this for external control
  onOpenChange?: (open: boolean) => void; // Add this for external control
}

export function CustomerForm({
  customer,
  mode,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: CustomerFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        }
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
        },
  });

  // Reset form when dialog opens or customer changes
  useEffect(() => {
    if (open && customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    } else if (open && !customer) {
      reset({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [open, customer, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (mode === "edit" && customer) {
        // Update existing customer
        updateCustomer(customer.id, data);
        alert("Customer updated successfully!");
      } else {
        // Add new customer
        addCustomer({
          ...data,
          totalPurchases: 0,
        });
        alert("Customer created successfully!");
      }

      reset(); // Clear form
      setOpen(false); // Close dialog
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to ${mode} customer`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === "add" && (
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="gap-2"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Make changes to customer information."
                : "Add a new customer to manage their credits and loyalty points."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Nalin Perera"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nalinperera@gmail.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Contact No.</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0777123456"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Address Field */}
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Avissawella"
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
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
                  : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
