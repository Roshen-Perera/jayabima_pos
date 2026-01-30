import { useSupplierStore } from '@/store/supplierStore';
import React, { use } from 'react'

const SupplierSearch = () => {

    const search = useSupplierStore((s) => s.search);
    

  return (
    <div>SupplierSearch</div>
  )
}

export default SupplierSearch