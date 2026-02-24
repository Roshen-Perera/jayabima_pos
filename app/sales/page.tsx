"use client";

import { useSalesStore } from "@/store/salesStore";
import React, { useState } from "react";

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
  return <div></div>;
};

export default Page;
