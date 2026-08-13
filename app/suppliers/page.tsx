"use client";

import React from "react";
import SupplierStats from "./components/SupplierStats";
import SupplierSearch from "./components/SupplierSearch";
import SupplierList from "./components/SupplierList";
import SupplierHeader from "./components/SupplierHeader";
import { PurchaseOrdersTab } from "./components/PurchaseOrdersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Truck } from "lucide-react";

const SuppliersPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <SupplierHeader />
      <SupplierStats />

      <Tabs defaultValue="suppliers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="suppliers" className="gap-2">
            <Building2 className="w-4 h-4" />
            Supplier Directory
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Truck className="w-4 h-4" />
            Purchase Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4 pt-2">
          <SupplierSearch />
          <SupplierList />
        </TabsContent>

        <TabsContent value="orders" className="pt-2">
          <PurchaseOrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuppliersPage;
