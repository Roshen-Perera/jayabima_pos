import CustomerDataCards from "@/components/CustomerDataCards";
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
      <CustomerDataCards />
      <CustomerList />
    </div>
  );
};

export default page;
