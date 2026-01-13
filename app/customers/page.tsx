import CustomerHeader from "@/components/CustomerHeader";
import CustomerList from "@/components/CustomerList";
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

const page = () => {
  // const newCustomers = customers.slice(-5); // Assuming last 5 are new customers
  // const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  // const outStandingCustomers = customers.filter(
  //   (c) => c.creditBalance > 0
  // ).length;

  return (
    <div className="flex flex-col gap-3">
      <CustomerHeader />
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
            <p className="text-2xl font-bold text-destructive">
              3
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding Credit</p>
            <p className="text-2xl font-bold text-destructive">
              Rs. 0
            </p>
          </CardContent>
        </Card>
      </div>
      <CustomerList />
    </div>
  );
};

export default page;
