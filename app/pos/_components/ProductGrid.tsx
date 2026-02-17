import React, { useState } from "react";

interface ProductGridProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
}

const ProductGrid = ({ searchQuery, onAddToCart }: ProductGridProps) => {
  const [products, setProducts] = useState<any[]>([]);
  return <div>ProductGrid</div>;
};

export default ProductGrid;
