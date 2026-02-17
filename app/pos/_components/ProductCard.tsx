"use client";

import { Product } from "@/app/inventory/_types/product.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  quantityInCart: number; // ⭐ Shows how many already in cart
}

const ProductCard = ({
  product,
  onAddToCart,
  quantityInCart,
}: ProductCardProps) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock <= product.minStock && product.stock > 0;
  const isMaxReached = quantityInCart >= product.stock;
  return (
    <div>
      <Button
        key={product.id}
        onClick={() => onAddToCart(product)}
        disabled={isOutOfStock || isMaxReached}
        className="group p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 text-left flex flex-col disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
          <Package className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="font-medium text-xs line-clamp-2 mb-1">{product.name}</p>
        <p className="text-[10px] text-muted-foreground mb-2">{product.sku}</p>
        <div className="mt-auto flex items-center justify-between gap-1">
          <p className="font-bold text-xs text-primary">
            Rs. {product.price.toLocaleString()}
          </p>
          <Badge
            variant={isLowStock ? "destructive" : "default"}
            className="text-[8px] px-1.5"
          >
            {product.stock}
          </Badge>
        </div>
      </Button>
    </div>
  );
};

export default ProductCard;
