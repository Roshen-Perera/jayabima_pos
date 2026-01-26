import { useProductStore } from '@/store/productStore';
import React from 'react'

const ProductList = () => {
  const products = useProductStore((s) => s.products);
  const search = useProductStore((s) => s.search);
  return (
    <div>
    
    </div>
  )
}

export default ProductList
