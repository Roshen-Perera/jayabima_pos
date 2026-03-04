export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export type Permission =
    // Dashboard
    | 'dashboard:view'

    // Sales/POS
    | 'pos:access'
    | 'pos:create_sale'
    | 'sales:view'
    | 'sales:view_all'
    | 'sales:refund'
    | 'sales:delete'

    // Inventory
    | 'inventory:view'
    | 'inventory:create'
    | 'inventory:update'
    | 'inventory:delete'
    | 'inventory:adjust_stock'

    // Customers
    | 'customers:view'
    | 'customers:create'
    | 'customers:update'
    | 'customers:delete'

    // Suppliers
    | 'suppliers:view'
    | 'suppliers:create'
    | 'suppliers:update'
    | 'suppliers:delete'

    // Employees/Users
    | 'employees:view'
    | 'employees:create'
    | 'employees:update'
    | 'employees:delete'
    | 'employees:manage_roles'

    // Reports
    | 'reports:view'
    | 'reports:view_financial'
    | 'reports:export'

    // Settings
    | 'settings:view'
    | 'settings:update';

export const rolePermissions: Record<UserRole, Permission[]> = {
    ADMIN: [
        // Full access to everything
        'dashboard:view',
        'pos:access',
        'pos:create_sale',
        'sales:view',
        'sales:view_all',
        'sales:refund',
        'sales:delete',
        'inventory:view',
        'inventory:create',
        'inventory:update',
        'inventory:delete',
        'inventory:adjust_stock',
        'customers:view',
        'customers:create',
        'customers:update',
        'customers:delete',
        'suppliers:view',
        'suppliers:create',
        'suppliers:update',
        'suppliers:delete',
        'employees:view',
        'employees:create',
        'employees:update',
        'employees:delete',
        'employees:manage_roles',
        'reports:view',
        'reports:view_financial',
        'reports:export',
        'settings:view',
        'settings:update',
    ],

    MANAGER: [
        // No employee management, no settings update
        'dashboard:view',
        'pos:access',
        'pos:create_sale',
        'sales:view',
        'sales:view_all',
        'sales:refund',
        'inventory:view',
        'inventory:create',
        'inventory:update',
        'inventory:adjust_stock',
        'customers:view',
        'customers:create',
        'customers:update',
        'customers:delete',
        'suppliers:view',
        'suppliers:create',
        'suppliers:update',
        'suppliers:delete',
        'employees:view', // Can view but not manage
        'reports:view',
        'reports:view_financial',
        'reports:export',
        'settings:view',
    ],

    CASHIER: [
        // POS and basic operations only
        'dashboard:view',
        'pos:access',
        'pos:create_sale',
        'sales:view', // Only their own sales
        'inventory:view',
        'customers:view',
        'customers:create', // Can add walk-in customers
    ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
    return rolePermissions[role]?.includes(permission) ?? false;
}