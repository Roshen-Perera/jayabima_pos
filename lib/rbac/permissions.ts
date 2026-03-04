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