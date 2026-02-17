"use client";

import { useState, useMemo } from "react";
import { usePOSStore } from "@/store/posStore";
import { productCategories } from "@/data/data";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "@/store/productStore";
import { ShoppingCart } from "lucide-react";
import { ScrollArea } from "radix-ui";
import CheckoutPanel from "./_components/CheckoutPanel";
import ProductGrid from "./_components/ProductGrid";
import ProductSearch from "./_components/ProductSearch";
import ReceiptModal from "./_components/ReceiptModal";
import { Sale } from "./_types/pos.types";

export default function POSPage() {
  const { products } = useProductStore();
  const { cart, addToCart } = usePOSStore();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Get unique categories from products
  const categories = useMemo(() => {
    const fromProducts = [...new Set(products.map((p) => p.category))];
    return fromProducts.length > 0 ? fromProducts : productCategories;
  }, [products]);

  // Handle successful checkout
  const handleCheckoutSuccess = (sale: Sale) => {
    setCompletedSale(sale);
    setIsReceiptOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 overflow-hidden">
      {/* LEFT SIDE - Products */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Search */}
        <ProductSearch value={searchQuery} onChange={setSearchQuery} />

        {/* Category Filter */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {/* All Category */}
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
              className="flex-shrink-0"
            >
              All
            </Button>

            {/* Category Buttons */}
            {categories.map((category) => {
              const count = products.filter(
                (p) => p.category === category && p.active,
              ).length;

              return (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                  className="flex-shrink-0 gap-1.5"
                >
                  {category}
                  {count > 0 && (
                    <Badge
                      variant={
                        categoryFilter === category ? "secondary" : "outline"
                      }
                      className="h-4 text-xs px-1"
                    >
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid
            products={products}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            cartItems={cart.items}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      {/* RIGHT SIDE - Cart */}
      <div className="w-80 flex-shrink-0">
        <ShoppingCart onCheckout={() => setIsCheckoutOpen(true)} />
      </div>

      {/* Checkout Dialog */}
      <CheckoutPanel
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Receipt Dialog */}
      <ReceiptModal
        open={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
      />
    </div>
  );
}
