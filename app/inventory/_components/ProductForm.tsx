import React from "react";
import { Product } from "../_types/product.types";

interface ProductFormProps {
  product?: Product;
  mode: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProductForm = ({ product, mode, open, onOpenChange }: ProductFormProps) => {
  return <div></div>;
};

export default ProductForm;
