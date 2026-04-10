"use client";
import { MoreVertical, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomerStore } from "@/store/customerStore";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Customer } from "../types/customer.types";
import { CustomerForm } from "./CustomerForm";
import { alert } from "@/lib/alert";

interface CustomerActionsProps {
  customer: Customer;
  type?: "active" | "inactive";
}

const CustomerActions = ({
  customer,
  type = "active",
}: CustomerActionsProps) => {
  const deactivateCustomer = useCustomerStore((s) => s.deactivateCustomer);
  const reactivateCustomer = useCustomerStore((s) => s.reactivateCustomer);
  const [showActionAlert, setShowActionAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDeactivate = async () => {
    await deactivateCustomer(customer.id);
    alert.success(`Customer ${customer.name} has been deactivated.`);

    setShowActionAlert(false);
  };

  const handleReactivate = async () => {
    await reactivateCustomer(customer.id);
    alert.success(`Customer ${customer.name} has been reactivated.`);

    setShowActionAlert(false);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="icon-sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-20" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="w-3 h-3 mr-4" />
              Edit
            </DropdownMenuItem>

            {type === "active" && (
              <DropdownMenuItem
                className="flex text-destructive"
                onClick={() => setShowActionAlert(true)}
              >
                <Trash2 className="w-3 h-3 mr-4 text-destructive" />
                Deactivate
              </DropdownMenuItem>
            )}

            {type === "inactive" && (
              <DropdownMenuItem
                className="flex"
                onClick={() => setShowActionAlert(true)}
              >
                <RotateCcw className="w-3 h-3 mr-4" />
                Reactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerForm
        customer={customer}
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showActionAlert} onOpenChange={setShowActionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {type === "active"
                ? `This will deactivate ${customer.name}. You can reactivate them later.`
                : `This will reactivate ${customer.name} and move them back to active customers.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={type === "active" ? handleDeactivate : handleReactivate}
              className={
                type === "active"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {type === "active"
                ? "Deactivate Customer"
                : "Reactivate Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CustomerActions;
