import { Package } from "lucide-react";
import React, { useMemo } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/app/inventory/_types/product.types";
import { CartItem } from "../_types/pos.types";
import { Badge } from "@/components/ui/badge";

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
    <>
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Package className="w-12 h-12 mb-2 opacity-50" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onAddToCart(product)}
                disabled={product.stock <= 0}
                className="group p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 text-left flex flex-col disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                  <Package className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-medium text-xs line-clamp-2 mb-1">
                  {product.name}
                </p>
                <p className="text-[10px] text-muted-foreground mb-2">
                  {product.sku}
                </p>
                <div className="mt-auto flex items-center justify-between gap-1">
                  <p className="font-bold text-xs text-primary">
                    Rs. {product.price.toLocaleString()}
                  </p>
                  <Badge
                    variant={
                      product.stock <= product.minStock
                        ? "destructive"
                        : "outline"
                    }
                    className="text-[10px] px-1.5"
                  >
                    {product.stock}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductGrid;
