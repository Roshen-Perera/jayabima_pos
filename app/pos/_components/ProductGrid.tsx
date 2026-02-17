import { Package } from "lucide-react";
import React, { useMemo } from "react";
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

const ProductGrid = ({
  products,
  searchQuery,
  categoryFilter,
  cartItems,
  onAddToCart,
}: ProductGridProps) => {
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

  const getQuantityInCart = (productId: string) => {
    const item = cartItems.find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <p className="text-muted-foreground font-medium">
          {searchQuery ? "No products found" : "No products available"}
        </p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-1">
            Try searching with a different term
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          quantityInCart={getQuantityInCart(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
