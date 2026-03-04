import { Permission } from "@/lib/rbac/permissions";
import { LayoutDashboard, ShoppingCart, FileText, Package, Users, Truck, UserCog, ChartColumn } from "lucide-react";

// Menu items.
export const navItems = [
    {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
        permission: 'dashboard:view' as Permission,
    },
    {
        title: 'POS / Billing',
        url: '/pos',
        icon: ShoppingCart,
        permission: 'pos:access' as Permission,
    },
    {
        title: 'Sales History',
        url: '/sales',
        icon: FileText,
        permission: 'sales:view' as Permission,
    },
    {
        title: 'Inventory',
        url: '/inventory',
        icon: Package,
        permission: 'inventory:view' as Permission,
    },
    {
        title: 'Customers',
        url: '/customers',
        icon: Users,
        permission: 'customers:view' as Permission,
    },
    {
        title: 'Suppliers',
        url: '/suppliers',
        icon: Truck,
        permission: 'suppliers:view' as Permission,
    },
    {
        title: 'Employees',
        url: '/employees',
        icon: UserCog,
        permission: 'employees:view' as Permission,
    },
    {
        title: 'Reports',
        url: '/reports',
        icon: ChartColumn,
        permission: 'reports:view' as Permission,
    },
];