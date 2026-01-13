import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Plus } from "lucide-react";
import React from "react";

const customers = [
  {
    id: "1",
    name: "Mahesh Silva",
    phone: "0771234567",
    email: "mahesh@gmail.com",
    creditBalance: 45000,
    loyaltyPoints: 1250,
    totalPurchases: 285000,
  },
  {
    id: "2",
    name: "Nimal Fernando",
    phone: "0772345678",
    email: "nimal@gmail.com",
    creditBalance: 0,
    loyaltyPoints: 890,
    totalPurchases: 156000,
  },
  {
    id: "3",
    name: "Sunil Perera",
    phone: "0773456789",
    email: "sunil@gmail.com",
    creditBalance: 12500,
    loyaltyPoints: 2100,
    totalPurchases: 420000,
  },
  {
    id: "4",
    name: "Ranjith Kumar",
    phone: "0774567890",
    email: "ranjith@gmail.com",
    creditBalance: 78000,
    loyaltyPoints: 560,
    totalPurchases: 95000,
  },
  {
    id: "5",
    name: "Kamal Jayasinghe",
    phone: "0775678901",
    email: "kamal@gmail.com",
    creditBalance: 0,
    loyaltyPoints: 3200,
    totalPurchases: 650000,
  },
];

const page = () => {
  const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  const bestCustomer = customers.map((c) => c.loyaltyPoints).sort((a, b) => b - a)[0];
  const bestCustomerDetails = customers.length
    ? customers.reduce(
        (best, current) =>
          current.loyaltyPoints > best.loyaltyPoints ? current : best,
        customers[0]
      )
    : null;

  const bestCustomerName = bestCustomerDetails?.name ?? "—";

  return (
    <div className="flex flex-col gap-3">
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
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding Credit</p>
            <p className="text-2xl font-bold text-destructive">
              Rs. {totalCredit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding Credit</p>
            <p className="text-2xl font-bold text-destructive">
              {bestCustomerName}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
