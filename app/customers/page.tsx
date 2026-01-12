import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Plus } from "lucide-react";
import React from "react";

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
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="stat">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Outstanding Credit</p>
            <p className="text-2xl font-bold text-destructive">
              Rs. {totalCredit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">VIP Customers</p>
            <p className="text-2xl font-bold text-primary">{vipCount}</p>
          </CardContent>
        </Card>
        <Card variant="stat">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Today</p>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
