import { useProductStore } from "@/store/productStore";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
}

const ProductGrid = ({ searchQuery, onAddToCart }: ProductGridProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/inventory/products");
      const data = await response.json();
      if (data.success) {
        // Filter based on search query
        let filtered = data.products;
        if (searchQuery) {
          filtered = data.products.filter(
            (product: any) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.category
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()),
          );
        }
        setProducts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
