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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
