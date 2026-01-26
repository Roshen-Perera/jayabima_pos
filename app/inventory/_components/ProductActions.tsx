import React, { useState } from "react";
import { Product } from "../_types/product.types";
import { useProductStore } from "@/store/productStore";

interface ProductActionsProps {
  product: Product;
}

const ProductActions = ({ product }: ProductActionsProps) => {
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  return <div></div>;
};

export default ProductActions;
