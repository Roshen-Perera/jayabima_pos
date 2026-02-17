import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
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
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ProductSearch;
