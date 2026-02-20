"use client";

import { useState, useMemo } from "react";
import { usePOSStore } from "@/store/posStore";
import { productCategories } from "@/data/data";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "@/store/productStore";
import CheckoutPanel from "./_components/CheckoutPanel";
import ProductGrid from "./_components/ProductGrid";
import ProductSearch from "./_components/ProductSearch";
import ReceiptModal from "./_components/ReceiptModal";
import { Sale } from "./_types/pos.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import ShoppingCart from "./_components/ShoppingCart";
import { ShoppingCart as CartIcon, ArrowLeft } from "lucide-react";

export default function POSPage() {
  const { products } = useProductStore();
  const { cart, addToCart } = usePOSStore();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [mobileView, setMobileView] = useState<"products" | "cart">("products");

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
      {/* LEFT SIDE - Products (always visible on lg+, conditionally on mobile) */}
      <div
        className={`flex-1 flex flex-col gap-3 overflow-hidden ${
          mobileView === "cart" ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Search */}
        <ProductSearch placeholder={searchQuery} onSearch={setSearchQuery} />

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
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <ProductGrid
            products={products}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            cartItems={cart.items}
            onAddToCart={addToCart}
          />
        </div>

        {/* Mobile floating cart button */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center lg:hidden z-10">
          <Button
            size="lg"
            className="shadow-xl gap-2 pr-5"
            onClick={() => setMobileView("cart")}
          >
            <CartIcon className="w-5 h-5" />
            View Cart
            {cart.items.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {cart.items.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* RIGHT SIDE - Cart (always visible on lg+, conditionally on mobile) */}
      <div
        className={`flex-shrink-0 flex flex-col w-full lg:w-auto overflow-hidden ${
          mobileView === "cart" ? "flex" : "hidden lg:flex"
        }`}
      >
        {/* Mobile back button */}
        <div className="flex items-center gap-2 mb-3 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-2"
            onClick={() => setMobileView("products")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ShoppingCart onCheckout={() => setIsCheckoutOpen(true)} />
        </div>
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
