import { Card, CardContent } from '@/components/ui/card';
import { customers } from '@/data/data';
import React from 'react'

const CustomerStats = () => {
  const newCustomers = customers.slice(-5); // Assuming last 5 are new customers
  const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  const outStandingCustomers = customers.filter(
    (c) => c.creditBalance > 0
  ).length;
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">New Customers</p>
            <p className="text-2xl font-bold text-destructive">{newCustomers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Outstanding Customers
            </p>
            <p className="text-2xl font-bold text-destructive">{outStandingCustomers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding Credit</p>
            <p className="text-2xl font-bold text-destructive">Rs. {totalCredit.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CustomerStats;
