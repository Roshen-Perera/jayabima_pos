import { Button } from '@/components/ui/button';
import { Download, Plus, Plus } from 'lucide-react';
import React from 'react'

const page = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Manage customers, credits and loyalty points
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="default" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Customer
          </  Button>
        </div>
      </div>
    </div>
  );
}

export default page