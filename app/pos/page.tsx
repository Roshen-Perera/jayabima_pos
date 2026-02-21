"use client";

import { useState, useMemo } from "react";
import { usePOSStore } from "@/store/posStore";
import { productCategories } from "@/data/data";

import { Button } from "@/components/ui/button";
import { useProductStore } from "@/store/productStore";
import CheckoutPanel from "./_components/CheckoutPanel";
import ProductGrid from "./_components/ProductGrid";
import ProductSearch from "./_components/ProductSearch";
import ReceiptModal from "./_components/ReceiptModal";
import { Sale } from "./_types/pos.types";
import ShoppingCart from "./_components/ShoppingCart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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
      <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
        {/* Search */}
        <ProductSearch placeholder={searchQuery} onSearch={setSearchQuery} />

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => {
              const count = products.filter(
                (p) => p.category === category && p.active,
              ).length;
              return (
                <SelectItem key={category} value={category}>
                  {category} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

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
        <div className=" flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <ShoppingCart onCheckout={() => setIsCheckoutOpen(true)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* RIGHT SIDE - Cart */}
      <div className="hidden xl:block flex-shrink-0">
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
