import React from "react";
import { Product } from "../_types/product.types";

const ProductForm = () => {
  interface ProductFormProps {
    product?: Product;
    mode: "add" | "edit";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
  return <div></div>;
};

export default ProductForm;
