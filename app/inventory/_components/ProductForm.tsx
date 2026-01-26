import React, { useState } from "react";
import { Product } from "../_types/product.types";

interface ProductFormProps {
  product?: Product;
  mode: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProductForm = ({
  product,
  mode,
  open,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ProductFormProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const setOpen = externalOnOpenChange || setInternalOpen;

  return <div></div>;
};

export default ProductForm;
