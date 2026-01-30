import { Building2 } from 'lucide-react';
import React from 'react'
import { SupplierForm } from './SupplierForm';

const SupplierHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your supplier relationships
          </p>
        </div>
      </div>
      <SupplierForm mode="add" />
    </div>
  );
}

export default SupplierHeader