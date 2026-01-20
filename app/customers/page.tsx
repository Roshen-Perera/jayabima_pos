"use client";

import React from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerList from "./components/CustomerList";
import CustomerStats from "./components/CustomerStats";
import CustomerSearch from "./components/CustomerSearch";
import { useCustomerStore } from "@/store/customerStore";

const Page = () => {
  const customers = useCustomerStore((s) => s.getFilteredCustomers());
  const search = useCustomerStore((s) => s.search);
  const setSearch = useCustomerStore((s) => s.setSearch);
  return (
    <div className="flex flex-col gap-3">
      <CustomerHeader />
      <CustomerStats  />
      <CustomerSearch value={search} onChange={setSearch} />
      <CustomerList customers={customers} />
    </div>
  );
};

export default Page;
