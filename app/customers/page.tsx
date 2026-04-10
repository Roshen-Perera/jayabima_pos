"use client";

import React, { useEffect } from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerList from "./components/CustomerList";
import CustomerStats from "./components/CustomerStats";
import CustomerSearch from "./components/CustomerSearch";
import { useCustomerStore } from "@/store/customerStore";

const Page = () => {
  const { loadCustomers, loadInactiveCustomers } = useCustomerStore();

  useEffect(() => {
    // Load fresh data when page mounts
    loadCustomers();
    loadInactiveCustomers();
  }, [loadCustomers, loadInactiveCustomers]);
  return (
    <div className="flex flex-col gap-3">
      <CustomerHeader />
      <CustomerStats />
      <CustomerSearch />
      <CustomerList />
    </div>
  );
};

export default Page;
