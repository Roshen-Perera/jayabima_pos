import React, { useState } from "react";
import { Product } from "../_types/product.types";
import { useProductStore } from "@/store/productStore";
import { alert } from "@/lib/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, RotateCcw, Trash2 } from "lucide-react";
import ProductForm from "./ProductForm";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductActionsProps {
  product: Product;
  type?: "active" | "inactive";
}

const ProductActions = ({ product, type = "active" }: ProductActionsProps) => {
  const deactivateProduct = useProductStore((s) => s.deactivateProduct);
  const reactivateProduct = useProductStore((s) => s.reactivateProduct);
  const [showActionAlert, setShowActionAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDeactivate = async () => {
    try {
      await deactivateProduct(product.id);
      alert.success(`Product ${product.name} has been deactivated.`);
      setShowActionAlert(false);
    } catch (error) {
      console.error("Error deactivating product:", error);
      alert.error("Failed to deactivate product");
    }
  };
  const handleReactivate = async () => {
    try {
      await reactivateProduct(product.id);
      alert.success(`Product ${product.name} has been reactivated.`);
      setShowActionAlert(false);
    } catch (error) {
      console.error("Error reactivating product:", error);
      alert.error("Failed to reactivate product");
    }
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
              <DropdownMenuItem onClick={() => setShowActionAlert(true)}>
                <RotateCcw className="w-3 h-3 mr-4" />
                Reactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductForm
        product={product}
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
                ? `This will deactivate ${product.name}. You can reactivate it later.`
                : `This will reactivate ${product.name} and move it back to active products.`}
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
              {type === "active" ? "Deactivate Product" : "Reactivate Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductActions;
