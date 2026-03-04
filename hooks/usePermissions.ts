import { getRolePermissions, hasAllPermissions, hasAnyPermission, hasPermission, Permission, UserRole } from "@/lib/rbac/permissions";
import { useAuthStore } from "@/store/useAuthStore";


export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const role = user?.role as UserRole;
    return {
        // Check single permission
        can: (permission: Permission) => {
            if (!role) return false;
            return hasPermission(role, permission);
        },
        // Check if has any of the permissions
        canAny: (permissions: Permission[]) => {
            if (!role) return false;
            return hasAnyPermission(role, permissions);
        },
        // Check if has all permissions
        canAll: (permissions: Permission[]) => {
            if (!role) return false;
            return hasAllPermissions(role, permissions);
        },
        // Role checks
        isAdmin: role === 'ADMIN',
        isManager: role === 'MANAGER',
        isCashier: role === 'CASHIER',
        
        permissions: role ? getRolePermissions(role) : [],

        role,
        user,
    }
}
