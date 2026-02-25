import { LayoutDashboard, ShoppingCart, FileText, Package, Users, Truck, UserCog, ChartColumn } from "lucide-react";

// Menu items.
export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'CASHIER'] as UserRole[] },
    { title: "POS / Billing", url: "/pos", icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'CASHIER'] as UserRole[] },
    { title: "Sales History", url: "/sales", icon: FileText, roles: ['ADMIN', 'MANAGER', 'CASHIER'] as UserRole[] },
    { title: "Inventory", url: "/inventory", icon: Package, roles: ['ADMIN', 'MANAGER'] as UserRole[] },
    { title: "Customers", url: "/customers", icon: Users, roles: ['ADMIN', 'MANAGER', 'CASHIER'] as UserRole[] },
    { title: "Suppliers", url: "/suppliers", icon: Truck, roles: ['ADMIN', 'MANAGER'] as UserRole[] },
    { title: "Employees", url: "/employees", icon: UserCog, roles: ['ADMIN'] as UserRole[] },
    { title: "Reports", url: "/reports", icon: ChartColumn, roles: ['ADMIN', 'MANAGER'] as UserRole[] },
];