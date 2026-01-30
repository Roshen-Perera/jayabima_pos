import React from "react";
import SupplierStats from "./components/SupplierStats";
import SupplierSearch from "./components/SupplierSearch";

const page = () => {
  return (
    <div className="flex flex-col gap-3">
      <SupplierStats />
      <SupplierSearch />
    </div>
  );
};

export default page;
