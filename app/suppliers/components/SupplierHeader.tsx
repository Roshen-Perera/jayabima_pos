import { Download } from 'lucide-react';
import React from 'react'
import { SupplierForm } from './SupplierForm';
import { Button } from '@/components/ui/button';

const SupplierHeader = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Manage your supplier relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <SupplierForm mode="add" />
        </div>
      </div>
    </div>
  );
}

export default SupplierHeader