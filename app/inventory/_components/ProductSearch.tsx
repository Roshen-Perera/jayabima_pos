import { useProductStore } from "@/store/productStore";
import { Search } from "lucide-react";
import React from "react";

const ProductSearch = () => {
  const search = useProductStore((s) => s.search);
  const setSearch = useProductStore((s) => s.setSearch);

  return (
    <>
      <div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </div>
    </>
  );
};

export default ProductSearch;
