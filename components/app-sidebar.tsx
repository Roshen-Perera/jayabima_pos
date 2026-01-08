import {
  ChartColumn,
  FileText,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: LayoutDashboard,
  },
  {
    title: "POS / Billing",
    url: "#",
    icon: ShoppingCart,
  },
  {
    title: "Orders",
    url: "#",
    icon: FileText,
  },
  {
    title: "Inventory",
    url: "#",
    icon: Package,
  },
  {
    title: "Customers",
    url: "#",
    icon: Users,
  },
  {
    title: "Suppliers",
    url: "#",
    icon: Truck,
  },
  { title: "Employees", url: "#", icon: UserCog },
  { title: "Reports", url: "#", icon: ChartColumn },
];

export function AppSidebar() {
  const activePage = "Dashboard"; // Set the active page here

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="my-5">
            <span className="text-xl font-semibold">POS System</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      className={
                        item.title === activePage ? "bg-orange-500" : ""
                      } // Apply orange background if active
                      href={item.url}
                    >
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
