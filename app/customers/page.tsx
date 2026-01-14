"use client";

import React from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerList from "./components/CustomerList";
import CustomerStats from "./components/CustomerStats";
import CustomerSearch from "./components/CustomerSearch";
import { useCustomerStore } from "@/store/customerStore";

const Page = () => {
    const customers = useCustomerStore((state) => state.customers);
    const filteredCustomers = useCustomerStore((state) =>
      state.getFilteredCustomers()
    );
    const search = useCustomerStore((state) => state.search);
    const setSearch = useCustomerStore((state) => state.setSearch);
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
