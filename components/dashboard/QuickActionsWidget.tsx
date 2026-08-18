"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  Users,
  Truck,
  FileText,
  ChartColumn,
} from "lucide-react";

export function QuickActionsWidget() {
  const actions = [
    { title: "POS / Billing", href: "/pos", icon: ShoppingCart },
    { title: "Sales History", href: "/sales", icon: FileText },
    { title: "Inventory", href: "/inventory", icon: Package },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Suppliers", href: "/suppliers", icon: Truck },
    { title: "Reports", href: "/reports", icon: ChartColumn },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link key={act.href} href={act.href}>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium">
                  <Icon className="h-4 w-4 text-orange-500 shrink-0" />
                  <span className="truncate">{act.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
