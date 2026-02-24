"use client";

import { useSalesStore } from "@/store/salesStore";
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
  return <div></div>;
};

export default Page;
