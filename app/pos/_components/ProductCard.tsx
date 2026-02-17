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
            
        </div>
      </Card>
    </div>
  );
};

export default ProductCard;
