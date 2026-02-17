"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    stock: number;
    image?: string;
    category?: string;
  };
  onAddToCart: (product: any) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const isOutOfStock = product.stock <= 0;
  return (
    <div>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="p-3">
            
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCard;
