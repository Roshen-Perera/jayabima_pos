"use client";

import {
  Calendar,
  ChartColumn,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { use } from "react";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "POS / Billing",
    url: "/pos",
    icon: ShoppingCart,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: FileText,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: Truck,
  },
  { title: "Employees", url: "/employees", icon: UserCog },
  { title: "Reports", url: "/reports", icon: ChartColumn },
];

export function AppSidebar() {
  // Determine the active page based on the current URL path.
  const pathName = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-5" />
                  {/* Or use an icon: <Home className="size-4" /> */}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Your App Name</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
                        item.url === pathName
                          ? "text-orange-500 bg-black/10"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                      href={item.url}
                    >
                      <item.icon className="mr-2" />{" "}
                      {/* Add margin to the right of the icon */}
                      <span className="font-medium">{item.title}</span>{" "}
                      {/* Make text bold */}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
