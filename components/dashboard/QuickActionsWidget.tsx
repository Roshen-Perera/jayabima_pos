"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  Users,
  Truck,
  FileText,
  ChartColumn,
  Zap,
} from "lucide-react";

export function QuickActionsWidget() {
  const actions = [
    {
      title: "New POS Sale",
      description: "Open checkout counter",
      href: "/pos",
      icon: ShoppingCart,
      color: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    {
      title: "Sales History",
      description: "View receipts & sales",
      href: "/sales",
      icon: FileText,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      title: "Inventory",
      description: "Manage products & stock",
      href: "/inventory",
      icon: Package,
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    {
      title: "Customers",
      description: "Credit balances & ledgers",
      href: "/customers",
      icon: Users,
      color: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
    {
      title: "Suppliers",
      description: "Purchase POs & payables",
      href: "/suppliers",
      icon: Truck,
      color: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    {
      title: "Reports",
      description: "Financial analytics",
      href: "/reports",
      icon: ChartColumn,
      color: "bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700",
    },
  ];

  return (
    <Card className="shadow-sm border">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-orange-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link key={act.href} href={act.href} className="group block">
                <div className="p-3 rounded-lg border border-border bg-card hover:border-orange-500/50 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2 h-full">
                  <div className={`p-2.5 rounded-lg ${act.color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400">
                      {act.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {act.description}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
