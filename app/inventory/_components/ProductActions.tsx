import React from "react";
import { Product } from "../_types/product.types";
import { useProductStore } from "@/store/productStore";

interface ProductActionsProps {
  product: Product;
}

const ProductActions = ({ product }: ProductActionsProps) => {
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  return <div></div>;
};

export default ProductActions;
