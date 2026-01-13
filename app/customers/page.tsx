import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Badge,
  Download,
  Mail,
  MoreVertical,
  Plus,
  Star,
  Users,
} from "lucide-react";
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
  const newCustomers = customers.slice(-5); // Assuming last 5 are new customers
  const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  const outStandingCustomers = customers.filter(
    (c) => c.creditBalance > 0
  ).length;

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
            <p className="text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Outstanding Customers
            </p>
            <p className="text-2xl font-bold text-destructive">
              {outStandingCustomers.toLocaleString()}
            </p>
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{customer.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Credit Balance
                    </p>
                    <p
                      className={`font-semibold ${
                        customer.creditBalance > 0
                          ? "text-destructive"
                          : "text-success"
                      }`}
                    >
                      Rs. {customer.creditBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Loyalty Points
                    </p>
                    <p className="font-semibold text-primary">
                      {customer.loyaltyPoints.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Total Purchases
                  </p>
                  <p className="font-semibold">
                    Rs. {customer.totalPurchases.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default page;
