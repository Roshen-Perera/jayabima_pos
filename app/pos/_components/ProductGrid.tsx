import React from 'react'

interface ProductGridProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
}

const ProductGrid = ({ searchQuery, onAddToCart }: ProductGridProps) => {
  return (
    <div>ProductGrid</div>
  )
}

export default ProductGrid