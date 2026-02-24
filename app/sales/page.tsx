"use client";

import { Button } from "@/components/ui/button";
import { useSalesStore } from "@/store/salesStore";
import { RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";

const Page = () => {
  const {
    searchQuery,
    dateFilter,
    paymentFilter,
    selectedSale,
    setSearchQuery,
    setDateFilter,
    setPaymentFilter,
    setSelectedSale,
    getFilteredSales,
    getTodayStats,
    fetchSales,
    isLoading,
  } = useSalesStore();
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const filteredSales = getFilteredSales();
  const stats = getTodayStats();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleViewReceipt = (sale: any) => {
    setSelectedSale(sale);
    setIsReceiptOpen(true);
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    // Don't clear selected sale immediately to allow animation
    setTimeout(() => setSelectedSale(null), 300);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales History</h1>
          <p className="text-muted-foreground">
            View and reprint all transactions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchSales()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default Page;
