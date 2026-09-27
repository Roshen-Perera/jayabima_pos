"use client";

import { Package, ShoppingCart, Plus, Check } from "lucide-react";
import React, { useMemo, useState } from "react";
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
  const [tappedProductId, setTappedProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Only show active products
      if (!product.active) return false;

      // Search filter
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode &&
          product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const handleProductTap = (product: Product) => {
    if (product.stock <= 0) return;

    // Haptic vibration feedback on mobile / tablet touchscreens
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Ignore if browser restricts vibration
      }
    }

    // Trigger visual touch micro-animation
    setTappedProductId(product.id);
    setTimeout(() => {
      setTappedProductId((prev) => (prev === product.id ? null : prev));
    }, 450);

    onAddToCart(product);
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-3">
          <Package className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground font-medium">
          {searchQuery ? "No products found" : "No products available"}
        </p>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-1">
            Try searching with another name or SKU
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pr-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-3">
        {filteredProducts.map((product) => {
          const inCartCount = getQuantityInCart(product.id);
          const isJustTapped = tappedProductId === product.id;
          const isOutOfStock = product.stock <= 0;
          const isLowStock = !isOutOfStock && product.stock <= product.minStock;

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => handleProductTap(product)}
              disabled={isOutOfStock}
              className={`
                group relative p-3 rounded-xl border text-left flex flex-col justify-between
                transition-all duration-150 transform select-none touch-manipulation cursor-pointer
                active:scale-[0.95] active:brightness-95 active:shadow-inner
                ${
                  isJustTapped
                    ? "ring-2 ring-primary border-primary bg-primary/10 shadow-md scale-[0.98]"
                    : inCartCount > 0
                      ? "bg-card border-primary/40 shadow-sm hover:border-primary hover:shadow-md"
                      : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                }
                ${isOutOfStock ? "opacity-50 cursor-not-allowed bg-muted/30" : ""}
              `}
            >
              {/* Floating +1 Pop Badge on Touch */}
              {isJustTapped && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-out fade-out zoom-out-150 duration-400">
                  <span className="bg-primary text-primary-foreground font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-0.5">
                    <Plus className="w-3 h-3 stroke-[3]" />1
                  </span>
                </span>
              )}

              {/* Top Row: Icon + In-Cart Badge / Low Stock Badge */}
              <div className="flex items-start justify-between gap-1 mb-2">
                <div
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                    ${
                      inCartCount > 0
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
                    }
                  `}
                >
                  {inCartCount > 0 ? (
                    <ShoppingCart className="w-4 h-4" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>

                {/* Badges in top right */}
                <div className="flex flex-col items-end gap-1">
                  {inCartCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground font-bold text-[11px] px-1.5 py-0 h-5 shadow-xs border border-primary-foreground/20">
                      {inCartCount} in cart
                    </Badge>
                  )}
                  {isOutOfStock ? (
                    <Badge
                      variant="destructive"
                      className="text-[9px] px-1 py-0 h-4"
                    >
                      Out of stock
                    </Badge>
                  ) : isLowStock ? (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 font-medium"
                    >
                      Low: {product.stock}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Qty: {product.stock}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Product Name & SKU */}
              <div className="flex-1 mb-2">
                <p className="font-semibold text-xs line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-mono text-muted-foreground truncate">
                    {product.sku}
                  </span>
                  {product.category && (
                    <span className="text-[9px] text-muted-foreground/80 bg-muted px-1.5 py-0.2 rounded truncate max-w-[80px]">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Price + Add Button feedback */}
              <div className="pt-1.5 border-t border-border/60 flex items-center justify-between gap-1">
                <div>
                  <p className="text-[9px] text-muted-foreground leading-none">Price</p>
                  <p className="font-bold text-xs text-primary mt-0.5">
                    Rs. {product.price.toLocaleString()}
                  </p>
                </div>

                <div
                  className={`
                    w-6 h-6 rounded-md flex items-center justify-center transition-all
                    ${
                      isJustTapped
                        ? "bg-primary text-primary-foreground scale-110"
                        : inCartCount > 0
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                    }
                  `}
                >
                  {isJustTapped ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
