"use client";

import React from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerList from "./components/CustomerList";
import CustomerStats from "./components/CustomerStats";
import CustomerSearch from "./components/CustomerSearch";
import { useCustomers } from "./hooks/useCustomers";

const Page = () => {
    const { customers, filteredCustomers, search, setSearch } = useCustomers();
  return (
    <div className="flex flex-col gap-3">
      <CustomerHeader />
      <CustomerStats customers={customers} />
      <CustomerSearch value={search} onChange={setSearch} />
      <CustomerList customers={filteredCustomers} />
    </div>
  );
};

export default Page;
