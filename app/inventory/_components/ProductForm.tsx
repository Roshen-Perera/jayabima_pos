import React from "react";
import { Product } from "../_types/product.types";

interface ProductFormProps {
  product?: Product;
  mode: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProductForm = () => {
  return <div></div>;
};

export default ProductForm;
