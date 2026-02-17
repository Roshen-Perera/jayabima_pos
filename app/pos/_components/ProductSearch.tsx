import { Search } from "lucide-react";
import React, { useState } from "react";

interface ProductSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const ProductSearch = ({ onSearch, placeholder }: ProductSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };
  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default ProductSearch;
