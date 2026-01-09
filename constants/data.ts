import { LayoutDashboard, ShoppingCart, FileText, Package, Users, Truck, UserCog, ChartColumn } from "lucide-react";

// Menu items.
export const navItems = [
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