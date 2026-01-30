import React from "react";
import SupplierStats from "./components/SupplierStats";
import SupplierSearch from "./components/SupplierSearch";
import SupplierList from "./components/SupplierList";

const page = () => {
  return (
    <div className="flex flex-col gap-3">
      <SupplierStats />
      <SupplierSearch />
      <SupplierList />
    </div>
  );
};

export default page;
