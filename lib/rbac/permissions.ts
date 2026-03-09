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
    | 'employees:view_details'
    | 'employees:create_admin'
    | 'employees:create_manager'
    | 'employees:create_cashier'
    | 'employees:update'
    | 'employees:delete'
    | 'employees:reset_password'

    // Reports
    | 'reports:view'
    | 'reports:view_financial'
    | 'reports:export'

    // Settings
    | 'settings:view'
    | 'settings:update'

    | 'profile:view'
    | 'profile:update'
    | 'profile:change_password';

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

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) => hasPermission(role, permission));
}

export function getRolePermissions(role: UserRole): Permission[] {
    return rolePermissions[role] || [];
}

export function canAccessRoute(role: UserRole, route: string): boolean {
    const routePermissionMap: Record<string, Permission> = {
        '/': 'dashboard:view',
        '/pos': 'pos:access',
        '/sales': 'sales:view',
        '/inventory': 'inventory:view',
        '/customers': 'customers:view',
        '/suppliers': 'suppliers:view',
        '/employees': 'employees:view',
        '/reports': 'reports:view',
        '/settings': 'settings:view',
    };

    const permission = routePermissionMap[route];
    return permission ? hasPermission(role, permission) : false;
}
