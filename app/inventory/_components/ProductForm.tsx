import React, { useEffect, useState } from "react";
import { Product } from "../_types/product.types";
import { useProductStore } from "@/store/productStore";
import { useForm } from "react-hook-form";
import { ProductFormData, productSchema } from "../lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { alert } from "@/lib/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { productCategories } from "@/data/data";
import { Textarea } from "@/components/ui/textarea";

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

  const [pricingMode, setPricingMode] = useState<"manual" | "calculator">(
    "manual",
  );

  const [sellingPrice, setSellingPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(40);

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

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (mode === "edit" && product) {
        updateProduct(product.id, data);
        alert.success(
          "Product updated!",
          `${data.name} has been updated successfully.`,
        );
      } else {
        addProduct(data);
        alert.success(
          "Product added!",
          `${data.name} has been added successfully.`,
        );
      }

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
      alert.error("Failed to save", "Something went wrong. Please try again.");
    }
  };

  const category = watch("category");
  const active = watch("active");

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        {mode === "add" && (
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="gap-2"
              onClick={() => setOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {mode === "edit" ? "Edit Product" : "Add Product"}
              </DialogTitle>
              <DialogDescription>
                {mode === "edit"
                  ? "Make changes to product information."
                  : "Add a new product to your inventory."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Wireless Mouse"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger
                      className={errors.category ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="WM-001"
                    {...register("sku")}
                    className={errors.sku ? "border-red-500" : ""}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku.message}</p>
                  )}
                </div>
              </div>

              {/* Price & Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Selling Price (Rs.)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="2500"
                    {...register("price", { valueAsNumber: true })}
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cost">Cost Price (Rs.)</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="1500"
                    {...register("cost", { valueAsNumber: true })}
                    className={errors.cost ? "border-red-500" : ""}
                  />
                  {errors.cost && (
                    <p className="text-sm text-red-500">
                      {errors.cost.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Stock & Min Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="45"
                    {...register("stock", { valueAsNumber: true })}
                    className={errors.stock ? "border-red-500" : ""}
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500">
                      {errors.stock.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="minStock">Min Stock Alert</Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="10"
                    {...register("minStock", { valueAsNumber: true })}
                    className={errors.minStock ? "border-red-500" : ""}
                  />
                  {errors.minStock && (
                    <p className="text-sm text-red-500">
                      {errors.minStock.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description..."
                  {...register("description")}
                  rows={3}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Active Product</Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive products won&apos;t appear in sales
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={(checked: boolean) =>
                    setValue("active", checked)
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save changes"
                    : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductForm;
