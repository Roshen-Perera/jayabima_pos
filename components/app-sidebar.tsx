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
import Image from "next/image";

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
              <Link href="#">
                {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-5" />
                </div> */}
                <div>
                  <Image
                    src="/jayabima-icon.png"
                    alt="Logo"
                    width={45}
                    height={45}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">JAYABIMA HARDWARE</span>
                </div>
              </Link>
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
                  <SidebarMenuButton
                    asChild
                    isActive={pathName === item.url}
                    className="data-[active=true]:bg-orange-500/10 data-[active=true]:text-orange-500"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
