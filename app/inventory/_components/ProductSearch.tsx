import { useProductStore } from "@/store/productStore";
import React from "react";

const ProductSearch = () => {
  const search = useProductStore((s) => s.search);
  const setSearch = useProductStore((s) => s.setSearch);
  const categoryFilter = useProductStore((s) => s.categoryFilter);
  

  return <div></div>;
};

export default ProductSearch;
