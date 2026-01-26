import React, { useState } from "react";
import { Product } from "../_types/product.types";
import { useProductStore } from "@/store/productStore";
import { alert } from "@/lib/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import ProductForm from "./ProductForm";

interface ProductActionsProps {
  product: Product;
}

const ProductActions = ({ product }: ProductActionsProps) => {
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = () => {
    deleteProduct(product.id);
    alert.success("Product deleted!", `${product.name} has been removed.`);
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

      <ProductForm
        product={product}
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <ConfirmationAlert
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDelete}
        title="Are you absolutely sure?"
        description={
          <>
            This will permanently delete{" "}
            <span className="font-semibold">{product.name}</span> from your
            inventory. This action cannot be undone.
          </>
        }
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};

export default ProductActions;
