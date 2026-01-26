import React, { useState } from "react";
import { Product } from "../_types/product.types";
import { useProductStore } from "@/store/productStore";
import { alert } from "@/lib/alert";

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
  return <div></div>;
};

export default ProductActions;
