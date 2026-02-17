import React from "react";

interface ProductSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const ProductSearch = ({onSearch, placeholder}: ProductSearchProps) => {
  return <div>ProductSearch</div>;
};

export default ProductSearch;
