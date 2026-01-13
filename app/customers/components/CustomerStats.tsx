import { Card, CardContent } from '@/components/ui/card';
import React from 'react'

const CustomerStats = () => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">New Customers</p>
            <p className="text-2xl font-bold text-destructive"></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">10</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Outstanding Customers
            </p>
            <p className="text-2xl font-bold text-destructive">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding Credit</p>
            <p className="text-2xl font-bold text-destructive">Rs. 0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CustomerStats;
