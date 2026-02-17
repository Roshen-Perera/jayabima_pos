import { useProductStore } from "@/store/productStore";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

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
  return <div>ProductGrid</div>;
};

export default ProductGrid;
