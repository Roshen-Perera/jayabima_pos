import { useProductStore } from '@/store/productStore';
import React from 'react'

const ProductList = () => {
  const products = useProductStore((s) => s.products);
  return (
    <div>
    
    </div>
  )
}

export default ProductList
