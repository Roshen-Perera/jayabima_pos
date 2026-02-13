import React from "react";
import { Supplier } from "../types/supplier.types";
import { useSupplierStore } from "@/store/supplierStore";
import { alert } from "@/lib/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { SupplierForm } from "./SupplierForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
            <DropdownMenuItem
              className="flex text-destructive focus:text-destructive"
              onClick={() => setShowDeleteAlert(true)}
            >
              <Trash2 className="w-3 h-3 mr-4 text-destructive" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <SupplierForm
        supplier={supplier}
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">{supplier.name}</span> from your
              supplier list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SupplierActions;
