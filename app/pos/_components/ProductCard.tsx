"use client";

import { Product } from "@/app/inventory/_types/product.types";
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
      ></Card>
    </div>
  );
};

export default ProductCard;
