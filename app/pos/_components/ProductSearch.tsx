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

  return <div>ProductSearch</div>;
};

export default ProductSearch;
