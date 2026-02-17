import { useProductStore } from "@/store/productStore";
import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/app/inventory/_types/product.types";
import { CartItem } from "../_types/pos.types";

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  categoryFilter: string;
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ products, searchQuery, categoryFilter, cartItems, onAddToCart }: ProductGridProps) => {
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Only show active products
      if (!product.active) return false;

      // Search filter
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        !categoryFilter ||
        categoryFilter === "all" ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground">
          {searchQuery ? "No products found" : "No products available"}
        </p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
