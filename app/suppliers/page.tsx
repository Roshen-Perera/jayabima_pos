import React from "react";
import SupplierStats from "./components/SupplierStats";
import SupplierSearch from "./components/SupplierSearch";
import SupplierList from "./components/SupplierList";
import SupplierHeader from "./components/SupplierHeader";

const page = () => {
  return (
    <div className="flex flex-col gap-3">
      <SupplierHeader />
      <SupplierStats />
      <SupplierSearch />
      <SupplierList />
    </div>
  );
};

export default page;
