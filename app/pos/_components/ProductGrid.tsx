import { useProductStore } from "@/store/productStore";
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
  return <div>ProductGrid</div>;
};

export default ProductGrid;
