"use client";

import ProductHeader from "./_components/ProductHeader";
import ProductStats from "./_components/ProductStats";
import ProductSearch from "./_components/ProductSearch";
import ProductList from "./_components/ProductList";

const page = () => {
  return (
    <>
      <div className="flex flex-col gap-3">
        <ProductHeader />
        <ProductStats />
        <ProductSearch />
        <ProductList />
      </div>
    </>
  );
};

export default page;
