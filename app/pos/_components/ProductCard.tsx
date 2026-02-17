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
        className={`overflow-hidden hover:shadow-md transition-all cursor-pointer ${
          isOutOfStock ? "opacity-60" : "hover:border-primary"
        }`}
        onClick={() => !isOutOfStock && !isMaxReached && onAddToCart(product)}
      >
        <div className="relative h-24 bg-muted flex items-center justify-center">
          <Package className="h-10 w-10 text-muted-foreground/30" />
          <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
            {product.category}
          </Badge>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          {quantityInCart > 0 && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
              {quantityInCart}
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3
            className="font-medium text-sm leading-tight line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-base font-bold text-primary">
              Rs. {product.price.toLocaleString()}
            </p>
            <span
              className={`text-xs font-medium ${
                isOutOfStock
                  ? "text-red-500"
                  : isLowStock
                    ? "text-orange-500"
                    : "text-green-600"
              }`}
            >
              {isOutOfStock ? "No stock" : `Stock: ${product.stock}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCard;
