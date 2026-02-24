"use client";

import { Button } from "@/components/ui/button";
import { useSalesStore } from "@/store/salesStore";
import { Filter, RefreshCw, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import SalesStats from "./components/SalesStats";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SalesTable from "./components/SalesTable";
import ReceiptModal from "../pos/_components/ReceiptModal";

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
      <SalesStats stats={stats} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by receipt #, customer, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={dateFilter}
          onValueChange={(value: any) => setDateFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="MOBILE">Mobile</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SalesTable sales={filteredSales} onViewReceipt={handleViewReceipt} />
      <ReceiptModal
        open={isReceiptOpen}
        onClose={handleCloseReceipt}
        sale={selectedSale}
      />
    </div>
  );
};

export default Page;
