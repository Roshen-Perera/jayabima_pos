"use client";

import { useState, useMemo, useEffect } from "react";
import { usePOSStore } from "@/store/posStore";
import { productCategories } from "@/data/data";

import { Button } from "@/components/ui/button";
import { useProductStore } from "@/store/productStore";
import { useCustomerStore } from "@/store/customerStore";
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
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { alert } from "@/lib/alert";

export default function POSPage() {
  const { products } = useProductStore();
  const loadProducts = useProductStore((s) => s.loadProducts);
  const loadInactiveProducts = useProductStore((s) => s.loadInactiveProducts);
  const loadCustomers = useCustomerStore((s) => s.loadCustomers);
  const { cart, addToCart } = usePOSStore();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Quick-Add by SKU or Barcode (Enter key in search)
  const handleQuickAdd = (code: string): boolean => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) return false;

    // 1. Exact SKU match
    let matched = products.find(
      (p) => p.active && p.sku.toLowerCase() === trimmed,
    );

    // 2. Exact Barcode match
    if (!matched) {
      matched = products.find(
        (p) => p.active && p.barcode && p.barcode.toLowerCase() === trimmed,
      );
    }

    // 3. Single candidate fallback
    if (!matched) {
      const candidates = products.filter(
        (p) =>
          p.active &&
          (p.name.toLowerCase().includes(trimmed) ||
            p.sku.toLowerCase().includes(trimmed) ||
            (p.barcode && p.barcode.toLowerCase().includes(trimmed))),
      );
      if (candidates.length === 1) {
        matched = candidates[0];
      }
    }

    if (matched) {
      addToCart(matched);
      alert.success(
        "Added to Cart",
        `${matched.name} (SKU: ${matched.sku})`,
      );
      return true;
    } else {
      alert.error(
        "Product Not Found",
        `No product found matching SKU or barcode "${code}"`,
      );
      return false;
    }
  };

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

  useEffect(() => {
    loadProducts();
    loadInactiveProducts();
    loadCustomers();
  }, [loadProducts, loadInactiveProducts, loadCustomers]);

  return (
    <div className="flex h-[calc(100vh-7rem)] xl:h-[calc(100vh-7rem)] gap-4 overflow-hidden">
      {/* LEFT SIDE - Products */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
        {/* Search & Quick-Add */}
        <ProductSearch
          placeholder="Search name/category, or scan/enter SKU and press Enter..."
          onSearch={setSearchQuery}
          onQuickAdd={handleQuickAdd}
          autoFocus
        />

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
        <div className="flex justify-center xl:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogTitle></DialogTitle>
              <div className="flex-shrink-0 h-200">
                <ShoppingCart onCheckout={() => setIsCheckoutOpen(true)} />
              </div>
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
