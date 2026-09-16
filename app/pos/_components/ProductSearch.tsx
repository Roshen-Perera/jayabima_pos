import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ScanBarcode } from "lucide-react";
import React, { useState, useRef } from "react";

interface ProductSearchProps {
  onSearch: (query: string) => void;
  onQuickAdd?: (code: string) => boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const ProductSearch = ({
  onSearch,
  onQuickAdd,
  placeholder = "Search products by name, SKU, barcode...",
  autoFocus = false,
}: ProductSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      if (onQuickAdd) {
        const added = onQuickAdd(searchQuery.trim());
        if (added) {
          setSearchQuery("");
          onSearch("");
        }
      }
    }
  };

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-24 h-10 text-sm shadow-sm"
        autoFocus={autoFocus}
      />
      <div className="absolute right-2 flex items-center gap-1">
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground border font-mono select-none"
          title="Scan barcode or type SKU and press Enter to quick-add to cart"
        >
          <ScanBarcode className="w-3.5 h-3.5 text-primary" />
          <span>Enter ↵</span>
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;
