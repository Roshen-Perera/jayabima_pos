"use client";

import React from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerList from "./components/CustomerList";
import CustomerStats from "./components/CustomerStats";
import CustomerSearch from "./components/CustomerSearch";
import { CustomerPaymentsTab } from "./components/CustomerPaymentsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Users } from "lucide-react";

const Page = () => {
  return (
    <div className="flex flex-col gap-4">
      <CustomerHeader />
      <CustomerStats />

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="directory" className="gap-2">
            <Users className="w-4 h-4" />
            Customer Directory
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <Receipt className="w-4 h-4" />
            Customer Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4 pt-2">
          <CustomerSearch />
          <CustomerList />
        </TabsContent>

        <TabsContent value="payments" className="pt-2">
          <CustomerPaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;

