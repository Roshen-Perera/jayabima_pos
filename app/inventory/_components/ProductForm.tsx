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
import { Calculator, Plus } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsTrigger,
} from "@/components/ui/tabs";

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
    getValues,
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
      setSellingPrice(product.price);
      // Calculate discount from existing cost and price
      if (product.price > 0 && product.cost > 0) {
        const calculatedDiscount =
          ((product.price - product.cost) / product.price) * 100;
        setDiscountPercentage(Math.round(calculatedDiscount));
      }
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
      setSellingPrice(0);
      setDiscountPercentage(40);
      setPricingMode("manual");
    }
  }, [open, product, reset]);

  const calculateCostFromDiscount = () => {
    if (sellingPrice <= 0) {
      alert.warning(
        "Enter selling price first",
        "Please enter a valid selling price",
      );
      return;
    }

    const calculatedCost = sellingPrice * (1 - discountPercentage / 100);
    const roundedCost = Math.round(calculatedCost);

    setValue("price", sellingPrice);
    setValue("cost", roundedCost);

    alert.success(
      "Cost calculated!",
      `Cost price: Rs. ${roundedCost.toLocaleString()}`,
    );
  };

  const calculateMargin = () => {
    const price = getValues("price");
    const cost = getValues("cost");

    if (price > 0 && cost > 0) {
      const margin = ((price - cost) / price) * 100;
      return margin.toFixed(1);
    }
    return "0";
  };

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

  // eslint-disable-next-line react-hooks/incompatible-library
  const category = watch("category");
  const active = watch("active");
  const currentPrice = watch("price");
  const currentCost = watch("cost");

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

        <DialogContent className="sm:max-w-137.5 max-h-[90vh] overflow-y-auto">
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
              {/* Pricing Section with Tabs */}
              <div className="grid gap-2">
                <Label>Pricing Method</Label>
                <Tabs
                  value={pricingMode}
                  onValueChange={(v) => setPricingMode(v as any)}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="calculator">
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculator
                    </TabsTrigger>
                  </TabsList>

                  {/* Manual Entry Tab */}
                  <TabsContent value="manual" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cost-manual">Cost Price (Rs.)</Label>
                        <Input
                          id="cost-manual"
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

                      <div className="grid gap-2">
                        <Label htmlFor="price-manual">
                          Selling Price (Rs.)
                        </Label>
                        <Input
                          id="price-manual"
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
                    </div>

                    {currentPrice > 0 && currentCost > 0 && (
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Profit Margin:
                          </span>
                          <span className="font-semibold text-green-600">
                            {calculateMargin()}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            Profit per unit:
                          </span>
                          <span className="font-semibold">
                            Rs. {(currentPrice - currentCost).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Reverse Calculator Tab - Price & Discount → Cost */}
                  <TabsContent value="calculator" className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        💡 Enter your selling price and discount percentage to
                        calculate cost automatically
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="selling-price">
                          Selling Price (Rs.)
                        </Label>
                        <Input
                          id="selling-price"
                          type="number"
                          placeholder="2500"
                          value={sellingPrice || ""}
                          onChange={(e) =>
                            setSellingPrice(Number(e.target.value))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          The price you want to sell this product for
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="discount">
                          Discount/Margin (%)
                          <span className="text-muted-foreground ml-2 text-sm">
                            Current: {discountPercentage}%
                          </span>
                        </Label>
                        <div className="flex gap-2">
                          <input
                            id="discount"
                            type="range"
                            min="0"
                            max="80"
                            step="5"
                            value={discountPercentage}
                            onChange={(e) =>
                              setDiscountPercentage(Number(e.target.value))
                            }
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            min="0"
                            max="80"
                            value={discountPercentage}
                            onChange={(e) =>
                              setDiscountPercentage(Number(e.target.value))
                            }
                            className="w-20"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your profit margin percentage
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={calculateCostFromDiscount}
                        variant="secondary"
                        className="w-full"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Cost Price
                      </Button>

                      {sellingPrice > 0 && (
                        <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Selling Price:
                            </span>
                            <span className="font-semibold text-lg">
                              Rs. {sellingPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Discount/Margin:
                            </span>
                            <span className="font-semibold text-green-600">
                              {discountPercentage}%
                            </span>
                          </div>
                          <div className="border-t border-border pt-2 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Cost Price:
                              </span>
                              <span className="text-lg font-bold text-primary">
                                Rs.{" "}
                                {Math.round(
                                  sellingPrice * (1 - discountPercentage / 100),
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="border-t border-border pt-2 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Profit per unit:
                              </span>
                              <span className="text-sm font-semibold text-green-600">
                                Rs.{" "}
                                {Math.round(
                                  sellingPrice * (discountPercentage / 100),
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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
