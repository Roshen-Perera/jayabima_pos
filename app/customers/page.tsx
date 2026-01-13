
import React from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerList from "./components/CustomerList";
import CustomerStats from "./components/CustomerStats";
import CustomerSearch from "./components/CustomerSearch";

const page = () => {
  return (
    <div className="flex flex-col gap-3">
      <CustomerHeader />
      <CustomerStats />
      <CustomerSearch />
      <CustomerList />
    </div>
  );
};

export default page;
