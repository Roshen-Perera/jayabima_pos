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
      <Card
        className={`group relative overflow-hidden rounded-xl border bg-background transition-all duration-200 
    hover:shadow-lg hover:-translate-y-0.5 cursor-pointer
    ${isOutOfStock ? "opacity-70 cursor-not-allowed" : "hover:border-primary/60"}
  `}
        onClick={() => !isOutOfStock && !isMaxReached && onAddToCart(product)}
      >
        {/* Top Section */}
        <div className="relative h-28 bg-muted/40 flex items-center justify-center border-b">
          <Package className="h-12 w-12 text-muted-foreground/40 group-hover:scale-110 transition-transform duration-200" />

          {/* Category Badge */}
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-md"
          >
            {product.category}
          </Badge>

          {/* Cart Quantity Bubble */}
          {quantityInCart > 0 && (
            <div
              className="absolute top-2 right-2 bg-primary text-primary-foreground 
        rounded-full h-7 w-7 flex items-center justify-center text-xs font-semibold shadow"
            >
              {quantityInCart}
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-white text-xs font-semibold tracking-wide">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-2">
          <h3
            className="font-semibold text-sm leading-tight line-clamp-2 min-h-[36px]"
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">
              Rs. {product.price.toLocaleString()}
            </p>

            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full
          ${
            isOutOfStock
              ? "bg-red-100 text-red-600"
              : isLowStock
                ? "bg-orange-100 text-orange-600"
                : "bg-green-100 text-green-600"
          }
        `}
            >
              {isOutOfStock ? "No stock" : `${product.stock} left`}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground truncate">
            SKU: {product.sku}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCard;
