import { useProductStore } from "@/store/productStore";
import React from "react";

const ProductList = () => {
  const products = useProductStore((s) => s.products);
  const search = useProductStore((s) => s.search);

  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Search filter
    if (search) {
      const keyword = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.sku.toLowerCase().includes(keyword) ||
          p.category.toLowerCase().includes(keyword),
      );
    }
    return filtered;
  }, [products, search]);
  return <div></div>;
};

export default ProductList;
