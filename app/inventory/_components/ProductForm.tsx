import React, { useEffect, useState } from "react";
import { Product } from "../_types/product.types";
import { useProductStore } from "@/store/productStore";
import { useForm } from "react-hook-form";
import { ProductFormData, productSchema } from "../lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";

interface ProductFormProps {
  product?: Product;
  mode: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProductForm = ({
  product,
  mode,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ProductFormProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const addProduct = useProductStore((state) => state.addProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: product
      ? {
          name: product.name,
          category: product.category,
          sku: product.sku,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          minStock: product.minStock,
          description: product.description || "",
          active: product.active,
        }
      : {
          name: "",
          category: "",
          sku: "",
          price: 0,
          cost: 0,
          stock: 0,
          minStock: 0,
          description: "",
          active: true,
        },
  });

  useEffect(() => {
    if (open && product) {
      reset({
        name: product.name,
        category: product.category,
        sku: product.sku,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        description: product.description || "",
        active: product.active,
      });
    } else if (open && !product) {
      reset({
        name: "",
        category: "",
        sku: "",
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 0,
        description: "",
        active: true,
      });
    }
  }, [open, product, reset]);

  return <div></div>;
};

export default ProductForm;
