import { useProductStore } from "@/store/productStore";
import React from "react";

const ProductSearch = () => {
  const search = useProductStore((s) => s.search);
  return <div></div>;
};

export default ProductSearch;
