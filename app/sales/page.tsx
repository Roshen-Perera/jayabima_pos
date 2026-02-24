"use client";

import { useSalesStore } from '@/store/salesStore';
import React from 'react'

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
  return (
    <div></div>
  )
}

export default Page