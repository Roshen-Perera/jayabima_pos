import React, { useEffect, useState } from "react";

interface ProductGridProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
}

const ProductGrid = ({ searchQuery, onAddToCart }: ProductGridProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
    } catch (error) {}
  };
  return <div>ProductGrid</div>;
};

export default ProductGrid;
