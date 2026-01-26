import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productCategories } from "@/data/data";
import { useProductStore } from "@/store/productStore";
import { Search } from "lucide-react";
import React from "react";

const ProductSearch = () => {
  const search = useProductStore((s) => s.search);
  const setSearch = useProductStore((s) => s.setSearch);
  const categoryFilter = useProductStore((s) => s.categoryFilter);
  const setCategoryFilter = useProductStore((s) => s.setCategoryFilter);

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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-50">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {productCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ProductSearch;
