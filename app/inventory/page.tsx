import React from "react";
import ProductHeader from "./_components/ProductHeader";
import ProductStats from "./_components/ProductStats";

const page = () => {
  return (
    <>
      <div className="flex flex-col gap-3">
        <ProductHeader />
        <ProductStats />
      </div>
    </>
  );
};

export default page;
